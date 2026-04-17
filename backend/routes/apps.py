@router.get("/{app_id}/download")
def download_file(
    app_id: int,
    db: Session = Depends(get_db)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "File not found")

    # Serve the file to anyone who clicks the button, no purchase required!
    return FileResponse(
        app.file_path, 
        filename=os.path.basename(app.file_path),
        media_type='application/octet-stream' 
    )