# Journal Growth Tracker - MVP Design Specification

## Core Value Proposition
Transform journaling from passive reflection into active personal growth tracking. Users write natural journal entries about their day, and AI identifies patterns in targeted growth areas over time, surfacing insights they couldn't see themselves.

## The One Feature (MVP)
**Journal → Analyze → Daily Growth Note**

Users write/upload a journal entry. AI analyzes it against their stated growth goals, then outputs a simple note showing: (1) which growth areas appeared today, (2) evidence from the entry, and (3) one small actionable insight.

## User Flow (MVP)
```
1. User opens app → Sees "New Entry" button
2. User captures journal page photo OR types entry
3. AI processes (5-10 sec loading)
4. User sees "Today's Growth Note" card with:
   - Date
   - Detected growth areas (e.g., "Communication", "Positivity")
   - Key moments from entry
   - One actionable insight
5. Note saved to timeline (swipe to see past notes)
```

## Technical Stack

### Frontend (iOS)
- **Framework**: SwiftUI
- **Language**: Swift 5.9+
- **UI Components**: Native SwiftUI components
- **Navigation**: NavigationStack (iOS 16+)
- **State Management**: @Observable / @State / @Environment (Swift Observation framework)
- **HTTP Client**: URLSession with async/await

### Backend
- **API Framework**: Flask (Python 3.11+)
- **Database**: MongoDB Atlas (free tier: 512MB)
- **ODM**: Mongoengine or PyMongo
- **Authentication**: JWT (Flask-JWT-Extended)
- **Image Storage**: AWS S3 (free tier: 5GB) or MongoDB GridFS
- **Deployment**: Railway or Render (free tier)

### AI/ML
- **Primary**: Google Gemini 1.5 Flash (free tier: 1,500 requests/day)
  - Vision capabilities for handwritten text extraction
  - Sentiment analysis + growth tracking
  - 1M token context window
- **Fallback**: OpenAI GPT-4o-mini ($0.15/1M input tokens)
  - Use if Gemini quality insufficient
  - Vision API for OCR

### Development Tools
- **IDE**: Xcode 15+
- **Mobile Preview**: iOS Simulator / Physical device
- **API Testing**: Postman or Thunder Client
- **Database GUI**: MongoDB Compass
- **Deployment**: Xcode Cloud or App Store Connect (mobile), Railway/Render (backend)
- **Version Control**: Git + GitHub

## Data Models (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  passwordHash: "bcrypt_hash_here",
  createdAt: ISODate("2026-01-19T12:00:00Z"),
  growthAreas: [
    {
      _id: ObjectId("..."),
      name: "Communication",
      description: "I want to be more charismatic and clear in conversations",
      createdAt: ISODate("2026-01-19T12:00:00Z"),
      isActive: true
    },
    {
      _id: ObjectId("..."),
      name: "Positivity",
      description: "Maintain positive attitude throughout the day",
      createdAt: ISODate("2026-01-19T12:00:00Z"),
      isActive: true
    }
  ]
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

### Journal Entries Collection
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."), // Reference to users._id
  createdAt: ISODate("2026-01-19T14:30:00Z"),
  
  // Input
  imageUrl: "s3://bucket/user_123/entry_456.jpg", // or GridFS file_id
  rawText: "Today I had a breakthrough conversation with my team...",
  
  // AI Analysis Output
  growthNote: {
    detectedAreas: [
      {
        areaId: ObjectId("..."),
        areaName: "Communication",
        evidenceSnippet: "I clearly articulated my ideas and the team understood",
        progressIndicator: "improving" // improving|steady|struggling|first_mention
      }
    ],
    keyMoments: [
      "Successfully explained complex technical concept to non-technical stakeholders",
      "Received positive feedback about clarity"
    ],
    actionableInsight: "Continue using analogies to explain technical concepts - it's working well",
    overallSentiment: "positive" // positive|neutral|challenging
  },
  
  // Metadata
  processingTimeSeconds: 3.2,
  aiModel: "gemini-1.5-flash", // or "gpt-4o-mini"
  apiCost: 0.0001, // for tracking
  version: 1
}
```

**Indexes:**
```javascript
db.journalEntries.createIndex({ userId: 1, createdAt: -1 })
db.journalEntries.createIndex({ "growthNote.detectedAreas.areaName": 1 })
db.journalEntries.createIndex({ rawText: "text" }) // Full-text search
```

### Memory Summaries Collection
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  lastUpdated: ISODate("2026-01-19T20:00:00Z"),
  
  // Compressed history for AI context window
  growthTimelines: [
    {
      areaId: ObjectId("..."),
      areaName: "Communication",
      baseline: {
        date: ISODate("2026-08-15T10:00:00Z"),
        entry: "I struggle to articulate my thoughts clearly in meetings",
        sentiment: "challenging"
      },
      recentEntries: [
        {
          date: ISODate("2026-12-10T14:00:00Z"),
          summary: "Demonstrated charisma and clarity despite receiving criticism",
          progressIndicator: "improving"
        },
        {
          date: ISODate("2026-01-15T09:00:00Z"),
          summary: "Led successful team discussion, felt confident",
          progressIndicator: "improving"
        }
      ],
      keyMilestones: [
        "First time maintaining composure under criticism (Dec 10, 2026)",
        "Successfully facilitated 30-person meeting (Jan 15, 2027)"
      ],
      totalEntries: 12,
      improvingCount: 8,
      strugglingCount: 2
    }
  ]
}
```

**Indexes:**
```javascript
db.memorySummaries.createIndex({ userId: 1 }, { unique: true })
```

## Backend Architecture (Flask)

### Project Structure
```
backend/
├── app.py                      # Main Flask application
├── config.py                   # Configuration (MongoDB URI, API keys)
├── requirements.txt            # Python dependencies
├── models/
│   ├── __init__.py
│   ├── user.py                 # User model (Mongoengine)
│   ├── journal_entry.py        # JournalEntry model
│   └── memory_summary.py       # MemorySummary model
├── routes/
│   ├── __init__.py
│   ├── auth.py                 # /auth/signup, /auth/login
│   ├── journal.py              # /journal/create, /journal/analyze, /journal/list
│   ├── growth.py               # /growth/timeline, /growth/summary
│   └── user.py                 # /user/profile, /user/growth-areas
├── services/
│   ├── __init__.py
│   ├── ai_service.py           # Gemini/GPT API integration
│   ├── memory_service.py       # Build context for AI from past entries
│   ├── ocr_service.py          # Image text extraction
│   └── storage_service.py      # S3 or GridFS image upload
├── utils/
│   ├── __init__.py
│   ├── jwt_helper.py           # JWT token generation/validation
│   └── validators.py           # Input validation
└── tests/
    ├── test_auth.py
    ├── test_journal.py
    └── test_ai_service.py
```

### Key API Endpoints
```python
# POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepass123"
}
# Response: { "token": "jwt_token_here", "userId": "..." }

# POST /auth/login
{
  "email": "user@example.com",
  "password": "securepass123"
}
# Response: { "token": "jwt_token_here", "userId": "..." }

# POST /journal/create
# Headers: Authorization: Bearer <jwt_token>
{
  "text": "Today I had a great conversation...",
  "image": "base64_encoded_image" // optional
}
# Response: { "entryId": "...", "message": "Entry created, analyzing..." }

# GET /journal/analyze/:entryId
# Headers: Authorization: Bearer <jwt_token>
# Response: { "growthNote": {...}, "processingTime": 3.2 }

# GET /journal/list?limit=10&skip=0
# Headers: Authorization: Bearer <jwt_token>
# Response: { "entries": [...], "total": 45 }

# GET /growth/timeline/:areaName
# Headers: Authorization: Bearer <jwt_token>
# Response: { "timeline": [...], "baseline": {...}, "milestones": [...] }

# POST /user/growth-areas
# Headers: Authorization: Bearer <jwt_token>
{
  "growthAreas": [
    { "name": "Communication", "description": "..." }
  ]
}
# Response: { "message": "Growth areas updated" }
```

### AI Service Integration
```python
# services/ai_service.py

import os
import google.generativeai as genai
from typing import Dict, List, Optional

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class AIAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze_entry(
        self,
        entry_text: str,
        growth_areas: List[Dict],
        memory_context: Optional[Dict] = None
    ) -> Dict:
        """
        Analyze journal entry and return growth note
        """
        system_prompt = self._build_system_prompt(growth_areas, memory_context)
        
        prompt = f"""{system_prompt}

Analyze this journal entry and create a growth note:

{entry_text}

Return ONLY valid JSON in this exact format:
{{
  "detectedAreas": [
    {{
      "areaId": "growth_area_id_here",
      "areaName": "Communication",
      "evidenceSnippet": "Quote from entry showing this",
      "progressIndicator": "improving"
    }}
  ],
  "keyMoments": ["moment 1", "moment 2"],
  "actionableInsight": "One specific suggestion",
  "overallSentiment": "positive"
}}
"""
        
        response = self.model.generate_content(prompt)
        return self._parse_response(response.text)
    
    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """
        Extract text from journal image using Gemini Vision
        """
        # Upload image
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }
        
        prompt = "Extract all text from this handwritten journal entry. Return only the text, no commentary."
        
        response = self.model.generate_content([prompt, image_part])
        return response.text
    
    def _build_system_prompt(
        self,
        growth_areas: List[Dict],
        memory_context: Optional[Dict]
    ) -> str:
        areas_text = "\n".join([
            f"- {area['name']}: {area['description']}"
            for area in growth_areas
        ])
        
        memory_text = "This is their first entry."
        if memory_context:
            memory_text = self._format_memory_context(memory_context)
        
        return f"""You are a personal growth analyst helping users track progress in specific areas of their life.

The user is tracking these growth areas:
{areas_text}

{memory_text}

Your task:
1. Identify which growth areas appear in today's entry
2. Extract specific evidence (quotes) for each area
3. Determine progress: improving, steady, struggling, or first_mention
4. Suggest ONE actionable insight based on patterns you notice
5. Assess overall sentiment of the entry

Be encouraging but honest. Focus on concrete evidence from the entry."""
    
    def _format_memory_context(self, memory: Dict) -> str:
        """Convert memory summary to readable context for AI"""
        context_parts = ["Historical context:"]
        
        for timeline in memory.get('growthTimelines', []):
            area_name = timeline['areaName']
            baseline = timeline.get('baseline', {})
            recent = timeline.get('recentEntries', [])
            
            context_parts.append(f"\n{area_name}:")
            if baseline:
                context_parts.append(f"  Baseline ({baseline['date']}): {baseline['entry']}")
            
            if recent:
                context_parts.append(f"  Recent progress:")
                for entry in recent[-3:]:  # Last 3 entries
                    context_parts.append(f"    - {entry['date']}: {entry['summary']}")
        
        return "\n".join(context_parts)
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse AI response, handling markdown code blocks"""
        import json
        import re
        
        # Remove markdown code blocks if present
        cleaned = re.sub(r'```json\n?|\n?```', '', response_text)
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Fallback: try to extract JSON from text
            print(f"JSON parse error: {e}")
            print(f"Response text: {response_text}")
            raise ValueError("AI returned invalid JSON format")
```

### Memory Service
```python
# services/memory_service.py

from models.journal_entry import JournalEntry
from models.memory_summary import MemorySummary
from datetime import datetime, timedelta
from typing import Dict, Optional

class MemoryService:
    @staticmethod
    def get_or_create_memory(user_id: str) -> Optional[Dict]:
        """Get memory summary for user, create if doesn't exist"""
        from models.memory_summary import MemorySummary
        
        memory = MemorySummary.objects(userId=user_id).first()
        if not memory:
            return None
        
        return memory.to_dict()
    
    @staticmethod
    def build_context_for_ai(user_id: str, limit: int = 5) -> Dict:
        """
        Build compressed context from last N entries for AI
        For MVP: Just send last 5 entries
        Post-MVP: Use compressed MemorySummary
        """
        entries = JournalEntry.objects(
            userId=user_id
        ).order_by('-createdAt').limit(limit)
        
        context = {
            'totalEntries': entries.count(),
            'recentEntries': []
        }
        
        for entry in entries:
            context['recentEntries'].append({
                'date': entry.createdAt.strftime('%Y-%m-%d'),
                'detectedAreas': [
                    area['areaName'] 
                    for area in entry.growthNote.get('detectedAreas', [])
                ],
                'sentiment': entry.growthNote.get('overallSentiment'),
                'progress': [
                    {
                        'area': area['areaName'],
                        'indicator': area['progressIndicator']
                    }
                    for area in entry.growthNote.get('detectedAreas', [])
                ]
            })
        
        return context
    
    @staticmethod
    def update_memory_summary(user_id: str):
        """
        Update compressed memory summary (run nightly or after each entry)
        For MVP: Can skip this, just use last 5 entries
        """
        # TODO: Implement aggregation logic
        pass
```

### Sample Flask Route
```python
# routes/journal.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_service import AIAnalyzer
from services.memory_service import MemoryService
from services.storage_service import StorageService
from models.journal_entry import JournalEntry
from models.user import User
import base64

journal_bp = Blueprint('journal', __name__)
ai_analyzer = AIAnalyzer()
storage_service = StorageService()

@journal_bp.route('/create', methods=['POST'])
@jwt_required()
def create_entry():
    """Create new journal entry and trigger AI analysis"""
    user_id = get_jwt_identity()
    data = request.json
    
    # Validate input
    entry_text = data.get('text')
    entry_image = data.get('image')  # base64 encoded
    
    if not entry_text and not entry_image:
        return jsonify({'error': 'Provide either text or image'}), 400
    
    # Handle image upload if present
    image_url = None
    if entry_image:
        try:
            image_bytes = base64.b64decode(entry_image)
            image_url = storage_service.upload_image(user_id, image_bytes)
            
            # Extract text from image if no text provided
            if not entry_text:
                entry_text = ai_analyzer.extract_text_from_image(image_bytes)
        except Exception as e:
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 500
    
    # Get user's growth areas
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    growth_areas = [
        {
            'id': str(area['_id']),
            'name': area['name'],
            'description': area['description']
        }
        for area in user.growthAreas if area.get('isActive', True)
    ]
    
    # Get memory context
    memory_context = MemoryService.build_context_for_ai(user_id, limit=5)
    
    # Analyze with AI
    try:
        growth_note = ai_analyzer.analyze_entry(
            entry_text=entry_text,
            growth_areas=growth_areas,
            memory_context=memory_context
        )
    except Exception as e:
        return jsonify({'error': f'AI analysis failed: {str(e)}'}), 500
    
    # Create entry in database
    entry = JournalEntry(
        userId=user_id,
        rawText=entry_text,
        imageUrl=image_url,
        growthNote=growth_note,
        aiModel='gemini-1.5-flash'
    )
    entry.save()
    
    return jsonify({
        'entryId': str(entry.id),
        'growthNote': growth_note,
        'message': 'Entry created and analyzed successfully'
    }), 201

@journal_bp.route('/list', methods=['GET'])
@jwt_required()
def list_entries():
    """Get user's journal entries with pagination"""
    user_id = get_jwt_identity()
    
    # Pagination
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    entries = JournalEntry.objects(
        userId=user_id
    ).order_by('-createdAt').skip(skip).limit(limit)
    
    total = JournalEntry.objects(userId=user_id).count()
    
    return jsonify({
        'entries': [entry.to_dict() for entry in entries],
        'total': total,
        'limit': limit,
        'skip': skip
    }), 200

@journal_bp.route('/<entry_id>', methods=['GET'])
@jwt_required()
def get_entry(entry_id):
    """Get specific journal entry"""
    user_id = get_jwt_identity()
    
    entry = JournalEntry.objects(id=entry_id, userId=user_id).first()
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    return jsonify(entry.to_dict()), 200
```

## Mobile App Architecture (iOS/Swift)

### App Structure
```
JournalGrowth/
├── JournalGrowthApp.swift          # App entry point
├── Info.plist
├── Assets.xcassets/
├── Models/
│   ├── User.swift                  # User model
│   ├── JournalEntry.swift          # Journal entry model
│   ├── GrowthNote.swift            # Growth note model
│   └── GrowthArea.swift            # Growth area model
├── Views/
│   ├── ContentView.swift           # Root view with navigation
│   ├── Auth/
│   │   ├── AuthView.swift          # Login/Signup container
│   │   ├── LoginView.swift
│   │   └── SignupView.swift
│   ├── Home/
│   │   ├── HomeView.swift          # Timeline of entries
│   │   └── EntryRowView.swift      # Individual entry in list
│   ├── Entry/
│   │   ├── NewEntryView.swift      # Create entry
│   │   ├── ProcessingView.swift    # Loading state
│   │   └── GrowthNoteView.swift    # Display analysis
│   └── Components/
│       ├── GrowthNoteCard.swift
│       ├── GrowthAreaBadge.swift
│       ├── CameraView.swift
│       └── LoadingSpinner.swift
├── Services/
│   ├── APIClient.swift             # URLSession networking
│   ├── AuthService.swift           # Login/signup/token management
│   └── JournalService.swift        # Journal CRUD operations
├── ViewModels/
│   ├── AuthViewModel.swift         # Auth state management
│   └── JournalViewModel.swift      # Journal entries state
├── Utilities/
│   ├── KeychainManager.swift       # Secure token storage
│   └── ImageProcessor.swift        # Image compression
└── Constants/
    ├── Colors.swift
    └── Config.swift                # API base URL
```

### API Service Layer
```swift
// Services/APIClient.swift

import Foundation

enum APIError: Error {
    case invalidURL
    case noData
    case decodingError
    case unauthorized
    case serverError(String)
}

actor APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let baseURL = "http://localhost:5000/api"
    #else
    private let baseURL = "https://your-app.railway.app/api"
    #endif

    private init() {}

    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add JWT token if available
        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }

        if httpResponse.statusCode == 401 {
            KeychainManager.shared.deleteToken()
            throw APIError.unauthorized
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError("Status code: \(httpResponse.statusCode)")
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
```
```swift
// Services/JournalService.swift

import Foundation

struct CreateEntryRequest: Encodable {
    let text: String
    let image: String?
}

struct CreateEntryResponse: Decodable {
    let entryId: String
    let growthNote: GrowthNote
    let message: String
}

struct EntriesListResponse: Decodable {
    let entries: [JournalEntry]
    let total: Int
    let limit: Int
    let skip: Int
}

actor JournalService {
    static let shared = JournalService()

    private init() {}

    func createEntry(text: String, imageBase64: String? = nil) async throws -> CreateEntryResponse {
        let body = CreateEntryRequest(text: text, image: imageBase64)
        return try await APIClient.shared.request(
            endpoint: "/journal/create",
            method: "POST",
            body: body
        )
    }

    func getEntries(limit: Int = 10, skip: Int = 0) async throws -> EntriesListResponse {
        return try await APIClient.shared.request(
            endpoint: "/journal/list?limit=\(limit)&skip=\(skip)"
        )
    }

    func getEntry(entryId: String) async throws -> JournalEntry {
        return try await APIClient.shared.request(
            endpoint: "/journal/\(entryId)"
        )
    }
}
```

## UI/UX Design Principles

### Visual Design
- **Color Palette**: 
  - Primary: Soft blue (#4A90E2) - trust, growth
  - Success: Muted green (#6BCF7F) - progress
  - Neutral: Warm gray (#F5F5F5) - backgrounds
  - Accent: Coral (#FF6B6B) - actionable items
- **Typography**: System fonts (SF Pro on iOS, Roboto on Android)
- **Spacing**: 8px grid system

### Interaction Patterns
- **Entry Submission**: Large FAB (Floating Action Button) for "New Entry"
- **Loading State**: Animated progress with encouraging micro-copy ("Reflecting on your day...")
- **Growth Note Display**: Card-based, swipeable carousel for timeline
- **Empty State**: Warm prompt "Ready to start tracking your growth?"

### Minimalism Rules
- Max 3 actions per screen
- No hamburger menus (bottom tab if needed post-MVP)
- One primary CTA per screen (high contrast)
- Animations < 300ms (feel instant)

## Development Roadmap (2-Week MVP Sprint)

### Week 1: Backend Foundation
**Days 1-2**: Setup
- Initialize Flask project with MongoDB Atlas
- Set up authentication (JWT) with Flask-JWT-Extended
- Create User and JournalEntry models (Mongoengine)
- Test MongoDB connection and basic CRUD

**Days 3-4**: Core API Routes
- Build `/auth/signup` and `/auth/login` endpoints
- Build `/journal/create` endpoint (text only, no AI yet)
- Build `/journal/list` endpoint with pagination
- Test all endpoints with Postman

**Days 5-7**: AI Integration
- Integrate Gemini API in `ai_service.py`
- Implement `analyze_entry()` function
- Test text analysis with sample journal entries
- Build `/journal/analyze` endpoint
- Handle error cases (API failures, rate limits)

### Week 2: Mobile App (iOS/Swift)
**Days 8-9**: Mobile Setup & Auth
- Create new Xcode project with SwiftUI
- Set up NavigationStack and app structure
- Build Auth views (LoginView/SignupView)
- Implement AuthViewModel with Keychain token storage
- Connect to Flask backend with APIClient

**Days 10-11**: Journal Flow
- Build NewEntryView (text input)
- Build ProcessingView (loading state)
- Build GrowthNoteView (display analysis)
- Wire up API calls to backend with async/await

**Days 12-14**: Timeline & Polish
- Build HomeView with entry list
- Add pull-to-refresh with .refreshable modifier
- Integrate PhotosPicker for camera/photo library
- Add image upload to S3/GridFS
- End-to-end testing on Simulator and physical devices
- Bug fixes and performance optimization

## Success Metrics (MVP Validation)

### Engagement
- **Primary**: 3+ entries in first week (indicates habit formation)
- **Secondary**: Time spent reading growth notes > 30 seconds

### Quality
- **AI Accuracy**: User thumbs-up on 70%+ of generated insights
- **Growth Area Relevance**: 80%+ of entries map to user-defined areas

### Technical Performance
- **API Response Time**: < 5 seconds for analysis
- **Uptime**: > 99% (Railway/Render monitoring)
- **Error Rate**: < 2% of API calls fail

### Retention
- **Week 1 → Week 2**: 50%+ of users make at least 1 entry in week 2
- **Qualitative**: 3+ user quotes saying "I noticed something I missed"

## Cost Projections

### MVP Phase (0-100 users)
```
MongoDB Atlas: $0 (free tier)
Railway/Render: $0 (free tier)
AWS S3: $0 (free tier: 5GB, 20k requests/month)
Gemini API: $0 (free tier: 1,500 requests/day)
Total: $0/month
```

### Growth Phase (100-1,000 users)
```
MongoDB Atlas: $9/month (2GB shared cluster)
Railway/Render: $5-10/month (hobby plan)
AWS S3: $1-2/month (10GB storage)
Gemini API: $5-10/month (if exceed free tier)
Total: $20-30/month
```

### Break-even Analysis
- Need ~10 paying users at $4.99/month to cover costs
- Target: 100 users, 10% conversion = sustainable

## Out of Scope (Post-MVP)

### Phase 2 Features
- [ ] Progress graphs/visualizations over time
- [ ] Weekly/monthly summary reports (automated via cron job)
- [ ] Social proof (anonymized community insights)
- [ ] Voice journaling input (Whisper API integration)
- [ ] Multi-language support
- [ ] Dark mode

### Technical Debt to Address Later
- [ ] Offline-first architecture (local SQLite + sync)
- [ ] End-to-end encryption for journal content
- [ ] Redis caching for frequently accessed entries
- [ ] Automated memory summarization (MongoDB aggregation pipelines)
- [ ] Rate limiting on API (Flask-Limiter)
- [ ] Comprehensive error logging (Sentry)

## Privacy & Ethics Considerations

### Data Handling
- **User Control**: Easy export/delete all data via `/user/export` and `/user/delete` endpoints
- **Transparency**: Show exactly what's sent to AI API in settings
- **Minimal Storage**: Only store what's needed for analysis
- **No Selling**: Explicit promise to never sell journal content
- **Encryption**: HTTPS for all API calls, bcrypt for passwords

### AI Responsibility
- **Bias Mitigation**: Test across diverse writing styles
- **Mental Health**: Don't diagnose, suggest professional help when detecting crisis language
  - Implement keyword detection for: "suicide", "self-harm", "hopeless"
  - Display crisis hotline numbers: 988 (US), appropriate local resources
- **Honesty**: If AI can't find growth evidence, say so (don't hallucinate progress)
- **Consent**: User acknowledges AI processing during onboarding

## Getting Started (Developer Quickstart)

### Backend Setup
```bash
# Clone repository
git clone <repo_url>
cd journal-tracker/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (.env file)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/journaldb
JWT_SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_key
AWS_ACCESS_KEY=your_aws_key  # if using S3
AWS_SECRET_KEY=your_aws_secret

# Run Flask development server
python app.py
# Server runs on http://localhost:5000
```

### iOS App Setup
```bash
# Open Xcode project
cd journal-tracker/JournalGrowth
open JournalGrowth.xcodeproj

# Configure API URL in Constants/Config.swift
# For development, the app uses localhost:5000
# For production, update the baseURL in APIClient.swift

# Build and run on Simulator
# - Select target device (iPhone 15 Pro recommended)
# - Press Cmd+R to build and run

# Run on physical device
# - Connect device via USB
# - Select device from target dropdown
# - Ensure signing team is configured in project settings
# - Press Cmd+R to build and run
```

### Testing the Full Flow
```bash
# 1. Start backend
cd backend && python app.py

# 2. Open iOS app in Xcode and run on Simulator
#    - Simulator should connect to localhost:5000

# 3. Test authentication
#    - Sign up with email/password
#    - Login and receive JWT token (stored in Keychain)

# 4. Test journal creation
#    - Create text entry
#    - Wait for AI analysis
#    - View growth note

# 5. Test timeline
#    - Create multiple entries
#    - View past entries on home screen
```

## API Keys & Secrets Management

**Development**:
- Backend: `.env` file (gitignored)
- iOS: Use `#if DEBUG` compiler flags in Config.swift for dev/prod URLs

**Production**:
- Backend: Railway/Render environment variables
- iOS: Use Xcode Cloud environment variables or xcconfig files for build-time configuration
```swift
// Example Config.swift
enum Config {
    #if DEBUG
    static let apiBaseURL = "http://localhost:5000/api"
    #else
    static let apiBaseURL = "https://your-app.railway.app/api"
    #endif
}
```

## MongoDB Query Examples

### Get Growth Timeline for Specific Area
```javascript
db.journalEntries.aggregate([
  { $match: { 
      userId: ObjectId("user_id_here"),
      "growthNote.detectedAreas.areaName": "Communication"
  }},
  { $unwind: "$growthNote.detectedAreas" },
  { $match: { "growthNote.detectedAreas.areaName": "Communication" }},
  { $sort: { createdAt: 1 }},
  { $project: {
      date: "$createdAt",
      evidence: "$growthNote.detectedAreas.evidenceSnippet",
      progress: "$growthNote.detectedAreas.progressIndicator",
      sentiment: "$growthNote.overallSentiment"
  }}
])
```

### Get Progress Summary Across All Areas
```javascript
db.journalEntries.aggregate([
  { $match: { userId: ObjectId("user_id_here") }},
  { $unwind: "$growthNote.detectedAreas" },
  { $group: {
      _id: "$growthNote.detectedAreas.areaName",
      totalMentions: { $sum: 1 },
      improvingCount: {
        $sum: { $cond: [
          { $eq: ["$growthNote.detectedAreas.progressIndicator", "improving"] },
          1, 0
        ]}
      },
      lastMention: { $max: "$createdAt" }
  }},
  { $sort: { totalMentions: -1 }}
])
```

## Questions for Next Steps

1. **Growth Areas**: Provide 5-7 suggested areas (Communication, Productivity, Health, Relationships, Creativity, Finance, Mindfulness) + allow custom?
2. **Frequency**: Recommend daily journaling but don't enforce (flexible timing)?
3. **Onboarding**: Require 2-3 growth areas minimum, max 5 to stay focused?
4. **Monetization**: 
   - Free tier: 10 entries/month
   - Premium: $4.99/month for unlimited + advanced insights (weekly summaries, trend graphs)
   - Family plan: $9.99/month for up to 4 accounts
5. **Privacy**: Offer local-only mode (no cloud backup, all processing on-device with local AI)?

---

**Document Version**: 2.1
**Last Updated**: January 2026
**Owner**: Shri
**Stack**: SwiftUI (iOS) + Flask + MongoDB + Gemini/GPT-4o-mini
**Status**: Ready for Development