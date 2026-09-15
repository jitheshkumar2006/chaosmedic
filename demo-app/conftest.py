import pytest

@pytest.fixture(autouse=True)
def reset_chaos():
    from app.user_service import deactivate_chaos
    deactivate_chaos()
    yield
    deactivate_chaos()
