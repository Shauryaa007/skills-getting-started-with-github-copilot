import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_activity():
    # Replace with a valid activity name and email for your app
    activity_name = next(iter(client.get("/activities").json().keys()))
    email = "testuser@example.com"
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code in (200, 400)
    # 200 if signup successful, 400 if already signed up or activity full

def test_unregister_activity():
    activity_name = next(iter(client.get("/activities").json().keys()))
    email = "testuser@example.com"
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code in (200, 400)
    # 200 if unregister successful, 400 if not registered
