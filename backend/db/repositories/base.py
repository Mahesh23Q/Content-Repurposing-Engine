"""
Base repository with common CRUD operations
"""
from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from uuid import UUID
from supabase import Client
from loguru import logger

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """
    Base repository implementing common CRUD operations
    """
    
    def __init__(self, client: Client, table_name: str):
        self.client = client
        self.table_name = table_name
        self.table = client.table(table_name)
    
    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new record
        """
        try:
            response = self.table.insert(data).execute()
            if response.data:
                logger.info(f"Created record in {self.table_name}: {response.data[0].get('id')}")
                return response.data[0]
            raise Exception("No data returned from insert")
        except Exception as e:
            logger.error(f"Error creating record in {self.table_name}: {e}")
            raise
    
    async def get_by_id(self, id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get record by ID
        """
        try:
            response = self.table.select("*").eq("id", str(id)).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting record from {self.table_name}: {e}")
            raise
    
    async def get_all(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all records with optional filters
        """
        try:
            query = self.table.select("*")
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            # Apply ordering
            query = query.order(order_by, desc=order_desc)
            
            # Apply pagination
            query = query.range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting records from {self.table_name}: {e}")
            raise
    
    async def update(self, id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a record
        """
        try:
            response = self.table.update(data).eq("id", str(id)).execute()
            if response.data:
                logger.info(f"Updated record in {self.table_name}: {id}")
                return response.data[0]
            raise Exception("No data returned from update")
        except Exception as e:
            logger.error(f"Error updating record in {self.table_name}: {e}")
            raise
    
    async def delete(self, id: UUID) -> bool:
        """
        Delete a record (hard delete)
        """
        try:
            response = self.table.delete().eq("id", str(id)).execute()
            logger.info(f"Deleted record from {self.table_name}: {id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting record from {self.table_name}: {e}")
            raise
    
    async def soft_delete(self, id: UUID) -> Dict[str, Any]:
        """
        Soft delete a record (set is_deleted to true)
        """
        return await self.update(id, {"is_deleted": True})
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filters
        """
        try:
            query = self.table.select("id", count="exact")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting records in {self.table_name}: {e}")
            raise
    
    async def exists(self, id: UUID) -> bool:
        """
        Check if record exists
        """
        record = await self.get_by_id(id)
        return record is not None
