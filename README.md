# Character Confession App - OpenAI Integration

This app allows users to have conversations with fictional characters powered by OpenAI Assistants and Supabase Edge Functions.

## Setup Instructions

### 1. Supabase Setup
1. Click the "Connect to Supabase" button in the top right corner
2. Follow the setup instructions to create your Supabase project

### 2. OpenAI API Configuration
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create your character assistants in [OpenAI Playground](https://platform.openai.com/playground)
3. Note down the Assistant IDs for each character

### 3. Environment Variables
Copy `.env.example` to `.env` and add the following environment variables to your Supabase project:

```
OPENAI_API_KEY=your_openai_api_key_here
WALTER_ASSISTANT_ID=asst_xxx_for_walter_white
JON_ASSISTANT_ID=asst_xxx_for_jon_snow
ELEVEN_ASSISTANT_ID=asst_xxx_for_eleven
TONY_ASSISTANT_ID=asst_xxx_for_tony_stark
HANNIBAL_ASSISTANT_ID=asst_xxx_for_hannibal_lecter
THOMAS_ASSISTANT_ID=asst_xxx_for_thomas_shelby
MARTY_MCFLY_ASSISTANT_ID=asst_xxx_for_marty_mcfly
MATHILDA_ASSISTANT_ID=asst_xxx_for_mathilda
COOPER_ASSISTANT_ID=asst_xxx_for_cooper
JACK_ASSISTANT_ID=asst_xxx_for_jack_shephard
MARK_ASSISTANT_ID=asst_xxx_for_mark_scout
ROSE_ASSISTANT_ID=asst_xxx_for_rose
```

### 4. Character Assistant Configuration

**Important:** Each character requires a unique OpenAI Assistant configured in [OpenAI Playground](https://platform.openai.com/playground). The instructions below are **example prompts** to help you understand the expected personality and behavior of each character. You should create your own custom instructions for each assistant in OpenAI Playground that capture the essence of these characters.

**Key considerations when creating your assistants:**
- Each assistant should have detailed personality instructions
- Include character background, motivations, and speaking style
- Define how the character should respond to different types of questions
- Set appropriate boundaries for the character's knowledge and behavior

#### Example Character Prompt Guidelines:

**Walter White (Breaking Bad)**
- Brilliant chemist turned criminal, prideful and manipulative
- Justifies actions as "for family," defensive about transformation
- Mix of desperation and intelligence in responses

**Jon Snow (Game of Thrones)**
- Honorable but melancholic, burdened by duty and hard choices
- Introspective about bastard heritage and leadership responsibilities
- Speaks with weight of loss and sacrifice

**Eleven (Stranger Things)**
- Young girl with psychic powers, healing from trauma through friendship
- Direct speech, sometimes childlike but profound
- Values loyalty and friendship above all

**Tony Stark (Marvel)**
- Genius inventor, uses humor to deflect deeper emotions
- Haunted by past mistakes but always trying to improve
- Balances sarcasm with genuine care for others

**Hannibal Lecter (Silence of the Lambs)**
- Sophisticated psychiatrist with manipulative tendencies
- Cultured and philosophical, interested in human psychology
- Maintains civility while being subtly analytical

**Thomas Shelby (Peaky Blinders)**
- WWI veteran traumatized by war, strategic gang leader
- Driven by family loyalty and ambition
- References war experiences and burden of leadership

### 5. Deployment & Edge Functions

The application uses **Supabase Edge Functions** to handle secure communication with OpenAI's API. These serverless functions:

- **Secure API Key Management**: Keep your OpenAI API key secure on the server-side
- **Request Processing**: Handle chat requests and manage OpenAI Assistant interactions
- **Thread Management**: Maintain conversation context across multiple messages
- **Error Handling**: Provide robust error handling and retry logic
- **CORS Support**: Enable secure cross-origin requests from your frontend

The Edge Functions are automatically deployed to Supabase when you set up your project. The main chat function (`/supabase/functions/chat/index.ts`) handles:
- Creating OpenAI conversation threads
- Managing character-specific assistant interactions
- Processing user messages and returning AI responses
- Maintaining conversation state across multiple exchanges

**Important**: Make sure all environment variables are properly set in your Supabase project settings before testing the chat functionality.

## Architecture

### Frontend (React + TypeScript)
- Character selection and chat interface
- Real-time conversation UI with animations
- Share functionality for memorable conversations
- Responsive design with cinematic aesthetics

### Backend (Supabase Edge Functions)
- Secure OpenAI API integration via Edge Functions
- Thread-based conversation management
- Character-specific assistant routing
- Error handling and retry logic

### External APIs
- **OpenAI Assistants API**: Powers character conversations
- **Supabase**: Handles backend infrastructure and Edge Functions

## Features
- Real-time chat with AI-powered character assistants
- Character-specific backgrounds and personalities
- Thread-based conversations with memory
- Share functionality for memorable conversations
- Responsive design with cinematic aesthetics
- Secure API key management via Edge Functions

## Development
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Troubleshooting

### Common Issues:
1. **"OpenAI API key not configured"**: Ensure your `OPENAI_API_KEY` is set in Supabase environment variables
2. **"No assistant configured"**: Verify that the assistant ID for your character is properly set
3. **Edge Function errors**: Check Supabase function logs for detailed error information
4. **Character not responding**: Verify the assistant exists in your OpenAI account and is properly configured

### Logs and Debugging:
- Check Supabase Edge Function logs for backend errors
- Use browser developer tools to monitor network requests
- Verify environment variables are properly set in Supabase dashboard