"""add performance indexes

Revision ID: a1b2c3d4e5f6
Revises: 6f07b9928ebf
Create Date: 2026-05-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '6f07b9928ebf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes for chat_messages.session_id and chat_sessions.user_id."""
    op.create_index('idx_chat_messages_session_id', 'chat_messages', ['session_id'])
    op.create_index('idx_chat_sessions_user_id', 'chat_sessions', ['user_id'])


def downgrade() -> None:
    """Remove performance indexes."""
    op.drop_index('idx_chat_messages_session_id', table_name='chat_messages')
    op.drop_index('idx_chat_sessions_user_id', table_name='chat_sessions')
