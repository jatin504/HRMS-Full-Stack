from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import Attendance, Employee
from ..schemas import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee. Returns 409 if already marked for the date."""
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    record = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status.value,
    )
    db.add(record)
    try:
        db.commit()
        db.refresh(record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for this employee on {payload.date}.",
        )

    return AttendanceResponse(
        id=record.id,
        employee_id=record.employee_id,
        date=record.date,
        status=record.status,
        employee_name=employee.full_name,
        employee_code=employee.employee_id,
    )


@router.get("/{employee_id}", response_model=list[AttendanceResponse])
def get_attendance(
    employee_id: int,
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    """Get attendance records for an employee, optionally filtered by date."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(Attendance.date == date_filter)

    records = query.order_by(Attendance.date.desc()).all()

    return [
        AttendanceResponse(
            id=r.id,
            employee_id=r.employee_id,
            date=r.date,
            status=r.status,
            employee_name=employee.full_name,
            employee_code=employee.employee_id,
        )
        for r in records
    ]
