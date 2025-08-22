// <CHANGE> Creating text-to-speech API endpoint for voice functionality

import { type NextRequest, NextResponse } from "next/server"
import type { TTSRequest, TTSResponse } from "@/utils/types"
import {
  sanitizeInput,
  validateTextInput,
  formatSuccessResponse,
  formatErrorResponse,
  handleAPIError,
  logAPIRequest,
  logAPIError,
} from "@/lib/utils"

// POST /api/tts - Convert text to speech (server-side implementation)
export async function POST(request: NextRequest) {
  try {
    logAPIRequest("POST", "/api/tts", request.headers.get("user-agent") || undefined)

    const body: TTSRequest = await request.json()

    // Validate required fields
    if (!body.text) {
      return formatErrorResponse("Text is required for TTS conversion", 400)
    }

    // Sanitize and validate input
    const sanitizedText = sanitizeInput(body.text)
    const validation = validateTextInput(sanitizedText, 5000) // Limit TTS to 5000 chars

    if (!validation.isValid) {
      return formatErrorResponse(`Text validation failed: ${validation.errors.join(", ")}`, 400)
    }

    // For MVP, we'll return instructions for client-side TTS
    // In production, this could integrate with Google Cloud TTS, AWS Polly, etc.
    const response: TTSResponse = {
      success: true,
      // For now, we'll let the client handle TTS using Web Speech API
      // In future, this could return an actual audio URL from cloud TTS service
    }

    // Add TTS configuration for client
    const ttsConfig = {
      text: sanitizedText,
      voice: body.voice || "default",
      speed: Math.max(0.5, Math.min(2.0, body.speed || 1.0)), // Clamp speed between 0.5 and 2.0
      language: body.language || "en-US",
      instructions: {
        useWebSpeechAPI: true,
        fallbackMessage: "Text-to-speech is not supported in your browser",
        recommendedVoices: ["Google US English", "Microsoft Zira - English (United States)", "Alex"],
      },
    }

    return NextResponse.json(formatSuccessResponse(ttsConfig, "TTS configuration prepared successfully"))
  } catch (error) {
    logAPIError(error, "POST /api/tts")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

// GET /api/tts/voices - Get available voices for TTS
export async function GET(request: NextRequest) {
  try {
    logAPIRequest("GET", "/api/tts/voices", request.headers.get("user-agent") || undefined)

    // Return common voice options that work with Web Speech API
    const voices = [
      {
        name: "Google US English",
        lang: "en-US",
        gender: "female",
        recommended: true,
      },
      {
        name: "Google UK English Female",
        lang: "en-GB",
        gender: "female",
        recommended: true,
      },
      {
        name: "Google UK English Male",
        lang: "en-GB",
        gender: "male",
        recommended: true,
      },
      {
        name: "Microsoft Zira",
        lang: "en-US",
        gender: "female",
        recommended: false,
      },
      {
        name: "Microsoft David",
        lang: "en-US",
        gender: "male",
        recommended: false,
      },
      {
        name: "Alex",
        lang: "en-US",
        gender: "male",
        recommended: false,
      },
    ]

    const response = {
      voices,
      instructions: {
        note: "Actual available voices depend on the user's browser and operating system",
        clientSideDetection: "Use speechSynthesis.getVoices() in the browser for real-time voice detection",
        fallback: "If no voices are available, display text instructions instead",
      },
    }

    return NextResponse.json(formatSuccessResponse(response))
  } catch (error) {
    logAPIError(error, "GET /api/tts/voices")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

// Future implementation notes for production TTS:
/*
For production deployment, you could integrate with:

1. Google Cloud Text-to-Speech:
   - High-quality neural voices
   - Multiple languages
   - SSML support for pronunciation control

2. AWS Polly:
   - Neural and standard voices
   - Real-time streaming
   - Custom lexicons for medical terms

3. Azure Cognitive Services Speech:
   - Custom neural voices
   - Medical terminology optimization
   - Real-time synthesis

Example integration with Google Cloud TTS:
\`\`\`typescript
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient();

const [response] = await client.synthesizeSpeech({
  input: { text: sanitizedText },
  voice: { 
    languageCode: 'en-US', 
    name: 'en-US-Neural2-F',
    ssmlGender: 'FEMALE' 
  },
  audioConfig: { 
    audioEncoding: 'MP3',
    speakingRate: body.speed || 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0
  },
});

// Save audio to blob storage and return URL
const audioUrl = await saveAudioToBlob(response.audioContent);
return { success: true, audioUrl };
