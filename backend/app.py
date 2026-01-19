from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db, create_entry, get_entry, get_entries
from ai_service import analyze_entry

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()


@app.route("/health")
def health_check():
    return {"status": "healthy"}


@app.route("/api/journal/analyze", methods=["POST"])
def analyze_journal_entry():
    """
    Main workflow: receive text input, analyze with AI, return growth note.
    """
    data = request.json

    if not data or not data.get("text"):
        return jsonify({"error": "Text is required"}), 400

    text = data["text"]

    # Run AI analysis
    growth_note = analyze_entry(text)

    # Save to database
    entry_id = create_entry(text, growth_note)

    return jsonify({
        "entryId": entry_id,
        "growthNote": growth_note,
        "message": "Entry analyzed successfully"
    }), 201


@app.route("/api/journal/<int:entry_id>", methods=["GET"])
def get_journal_entry(entry_id):
    """Get a specific journal entry by ID."""
    entry = get_entry(entry_id)

    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    return jsonify(entry)


@app.route("/api/journal", methods=["GET"])
def list_journal_entries():
    """List all journal entries with pagination."""
    limit = request.args.get("limit", 10, type=int)
    offset = request.args.get("offset", 0, type=int)

    entries = get_entries(limit, offset)

    return jsonify({
        "entries": entries,
        "limit": limit,
        "offset": offset
    })


if __name__ == "__main__":
    print("Starting Journal Growth Tracker API...")
    print("Endpoints:")
    print("  POST /api/journal/analyze - Analyze a journal entry")
    print("  GET  /api/journal/<id>    - Get an entry by ID")
    print("  GET  /api/journal         - List all entries")
    print()
    print("Server running on http://localhost:8000")
    app.run(debug=True, port=8000)
