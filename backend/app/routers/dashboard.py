from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Attendance, Employee
from ..schemas import DashboardResponse, EmployeePresentDays

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Return dashboard summary: totals + per-employee present-day counts."""
    today = date.today()

    total_employees = db.query(func.count(Employee.id)).scalar()

    present_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Present")
        .scalar()
    )

    absent_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .scalar()
    )

    # Per-employee total present days
    rows = (
        db.query(
            Employee.id,
            Employee.employee_id,
            Employee.full_name,
            Employee.department,
            func.count(Attendance.id).label("total_present"),
        )
        .outerjoin(
            Attendance,
            (Attendance.employee_id == Employee.id) & (Attendance.status == "Present"),
        )
        .group_by(Employee.id)
        .order_by(Employee.full_name)
        .all()
    )

    employee_present_days = [
        EmployeePresentDays(
            employee_id=row.id,
            employee_code=row.employee_id,
            full_name=row.full_name,
            department=row.department,
            total_present=row.total_present,
        )
        for row in rows
    ]

    return DashboardResponse(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        employee_present_days=employee_present_days,
    )
