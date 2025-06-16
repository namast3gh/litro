from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models import User

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role is None or current_user.role.name.lower() not in [role.lower() for role in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У вас нет прав для доступа к этому ресурсу"
            )
        return current_user
