import io


def test_get_user(client):
    response = client.get("/users/42")
    assert response.status_code == 200
    assert response.json() == {"id": 42}


def test_get_files_empty(client):
    response = client.get("/files", params={"browser_id": "test-browser-1"})
    assert response.status_code == 200
    assert response.json() == {"files": []}


def test_save_and_list_file(client):
    fake_file = io.BytesIO(b"hello world")
    response = client.post(
        "/save",
        data={
            "browser_id": "test-browser-1",
            "file_code": "111111",
            "file_status": "sent",
        },
        files={"files": ("hello.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["browser_id"] == "test-browser-1"
    assert len(body["files"]) == 1
    assert body["files"][0]["file_name"] == "hello.txt"

    list_response = client.get("/files", params={"browser_id": "test-browser-1"})
    assert len(list_response.json()["files"]) == 1


def test_sender_cannot_download_own_file(client):
    fake_file = io.BytesIO(b"secret data")
    client.post(
        "/save",
        data={"browser_id": "test-browser-2", "file_code": "222222", "file_status": "sent"},
        files={"files": ("secret.txt", fake_file, "text/plain")},
    )

    response = client.get("/download/222222", params={"browser_id": "test-browser-2"})
    assert response.status_code == 400
    assert "cannot download your own file" in response.json()["detail"]


def test_different_browser_can_download(client):
    fake_file = io.BytesIO(b"shared content")
    client.post(
        "/save",
        data={"browser_id": "sender-browser", "file_code": "333333", "file_status": "sent"},
        files={"files": ("shared.txt", fake_file, "text/plain")},
    )

    response = client.get("/download/333333", params={"browser_id": "receiver-browser"})
    assert response.status_code == 200
    assert response.content == b"shared content"


def test_download_nonexistent_code(client):
    response = client.get("/download/999999", params={"browser_id": "anyone"})
    assert response.status_code == 404