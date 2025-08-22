# HealthSpeak - Medical Prescription Translation App

**Team Nexora** - Hackathon Project  
**Team Leader:** Santosh Donapurge  
**Members:** Rushang Chandekar, Shivam Naredi, Shivraj Ambhore, Sargun Singh Bhatia

## 🏥 Project Overview

HealthSpeak transforms confusing medical prescriptions into clear, plain language that anyone can understand. Using advanced OCR and comprehensive medical dictionaries, our app scans prescriptions and delivers step-by-step, conversational instructions with voice narration for improved accessibility.

## 🚀 Features

- **Prescription Scanning**: Upload or scan handwritten/printed prescriptions
- **Plain Language Translation**: Converts medical jargon into friendly, understandable instructions
- **Voice Narration**: Audio playback for accessibility
- **History Tracking**: Save and search previous prescriptions
- **Multi-language Support**: (Roadmap feature)
- **Comprehensive Medical Dictionary**: Extensive database of medical terms and abbreviations

## 🛠 Tech Stack

- **Frontend**: React.js, Next.js 15, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB Atlas
- **OCR**: Google Vision API
- **AI Processing**: Med7 (spaCy NER model)
- **Voice**: Browser SpeechSynthesis API
- **Database**: MongoDB Atlas (Cloud)
- **Animations**: Framer Motion

## 📁 Project Structure

\`\`\`
healthspeak/
├── app/                     # Next.js app router
│   ├── api/                 # Backend API routes
│   │   ├── history/         # Prescription history CRUD
│   │   ├── healthcheck/     # System health monitoring
│   │   ├── ocr/            # OCR processing (Person B)
│   │   ├── simplify/       # AI simplification (Person B)
│   │   └── tts/            # Text-to-speech
│   ├── history/            # History page (Person A)
│   ├── profile/            # Profile settings (Person A)
│   └── translate/          # Main upload page (Person A)
├── components/             # Shared UI components
│   ├── forms/              # Form components (Person A)
│   ├── display/            # Result display (Person A)
│   └── audio-player.tsx    # Voice playback (Person D)
├── lib/                    # Core utilities and database
│   ├── mongodb.ts          # MongoDB Atlas connection
│   ├── db-history.ts       # History data operations
│   ├── db.ts              # Medical dictionary (Person B)
│   ├── ocr.ts             # OCR wrapper (Person B)
│   ├── simplify.ts        # AI processing (Person B)
│   └── utils.ts           # Utility functions
├── scripts/               # Setup and testing scripts
│   ├── setup-mongodb.ts   # Database initialization
│   └── test-mongodb.ts    # Connection testing
└── utils/
    └── types.ts           # TypeScript definitions
\`\`\`

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <repository-url>
cd healthspeak
npm install
\`\`\`

### 2. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Create a database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

2. **Get Connection String**:
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 3. Environment Configuration

\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/healthspeak?retryWrites=true&w=majority
MONGODB_DB_NAME=healthspeak
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-service-key.json
MAX_FILE_SIZE_MB=5
\`\`\`

### 4. Database Setup

\`\`\`bash
# Initialize MongoDB with sample data
npm run setup-mongodb

# Test MongoDB connection
npm run test-mongodb
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 🧪 API Testing

### Health Check
\`\`\`bash
# Basic health check
curl http://localhost:3000/api/healthcheck

# Detailed health check with statistics
curl http://localhost:3000/api/healthcheck?detailed=true
\`\`\`

### History API
\`\`\`bash
# Get all prescriptions
curl http://localhost:3000/api/history

# Search prescriptions
curl "http://localhost:3000/api/history?q=paracetamol"

# Get statistics
curl "http://localhost:3000/api/history?stats=true"

# Add new prescription
curl -X POST http://localhost:3000/api/history \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Take Paracetamol 500mg twice daily",
    "simplifiedText": "Take 1 Paracetamol tablet (500mg) two times per day",
    "tags": ["fever", "headache"]
  }'
\`\`\`

## 👥 Team Responsibilities

### Person A - Frontend (Rushang Chandekar)
- React.js frontend development
- Tailwind CSS + shadcn/ui styling
- Framer Motion animations
- Upload screens and result displays

### Person B - AI Processing (Shivam Naredi)
- Google Vision API integration
- Med7 NER model implementation
- Medical dictionary creation
- OCR and simplification APIs

### Person C - Backend & Data (Shivraj Ambhore) ⭐
- MongoDB Atlas integration
- REST API development
- Database schema design
- Security and validation
- History management system

### Person D - Voice & Testing (Sargun Singh Bhatia)
- SpeechSynthesis API integration
- End-to-end testing
- Cross-device compatibility
- Audio playback components

## 🔒 Security Features

- Input sanitization and validation
- File size limits for uploads
- MongoDB injection prevention
- Error handling without stack trace exposure
- Environment variable protection

## 📊 Database Schema

### History Collection
\`\`\`typescript
{
  _id: ObjectId,
  originalText: string,
  simplifiedText: string,
  prescription: {
    patientInfo: { name, age, gender, allergies },
    doctorInfo: { name, specialization, contact },
    items: [{
      medicine: { name, strength, form, category },
      dosage: { amount, frequency, duration, timings },
      quantity: string,
      warnings: string[]
    }]
  },
  processingStatus: "pending" | "completed" | "failed",
  tags: string[],
  createdAt: string,
  updatedAt: string
}
\`\`\`

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
\`\`\`
MONGODB_URI=your_production_mongodb_uri
MONGODB_DB_NAME=healthspeak
GOOGLE_APPLICATION_CREDENTIALS=your_google_credentials
MAX_FILE_SIZE_MB=5
NODE_ENV=production
\`\`\`

## 🔍 Monitoring and Debugging

- Health check endpoint: `/api/healthcheck`
- Detailed logging with `[v0]` prefixes
- MongoDB connection monitoring
- Memory usage tracking
- Response time measurements

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is created for the Hackathon competition. All rights reserved by Team Nexora.

## 🏆 Hackathon Details

- **Event**: SMACKATHON 2K25
- **Team**: Nexora
- **College**: JDCOEM
- **Contact**: techsmackathon2k25@gmail.com

---

**Built with ❤️ by Team Nexora for SMACKATHON 2K25**
