from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Employee ────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Attendance ──────────────────────────────────────────────────────

class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


class AttendanceCreate(BaseModel):
    employee_id: int = Field(..., description="Internal employee PK")
    date: date
    status: AttendanceStatus


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    class Config:
        from_attributes = True


# ── Dashboard ───────────────────────────────────────────────────────

class EmployeePresentDays(BaseModel):
    employee_id: int
    employee_code: str
    full_name: str
    department: str
    total_present: int


class DashboardResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    employee_present_days: list[EmployeePresentDays]
