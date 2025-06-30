import { corsHeaders } from '../_shared/cors.ts';

interface ChatRequest {
  message: string;
  characterId: string;
  threadId?: string;
}

interface ChatResponse {
  message: string;
  threadId: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, characterId, threadId }: ChatRequest = await req.json();

    if (!message || !characterId) {
      return new Response(
        JSON.stringify({ error: 'Message and characterId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Character to Assistant ID mapping - updated with all new characters
    const assistantMapping: Record<string, string> = {
      'walter-white': Deno.env.get('WALTER_ASSISTANT_ID') || '',
      'jon-snow': Deno.env.get('JON_ASSISTANT_ID') || '',
      'eleven': Deno.env.get('ELEVEN_ASSISTANT_ID') || '',
      'tony-stark': Deno.env.get('TONY_ASSISTANT_ID') || '',
      'hannibal-lecter': Deno.env.get('HANNIBAL_ASSISTANT_ID') || '',
      'thomas-shelby': Deno.env.get('THOMAS_ASSISTANT_ID') || '',
      'marty-mcfly': Deno.env.get('MARTY_MCFLY_ASSISTANT_ID') || '',
      'mathilda': Deno.env.get('MATHILDA_ASSISTANT_ID') || '',
      'joseph-cooper': Deno.env.get('COOPER_ASSISTANT_ID') || '',
      'jack-shephard': Deno.env.get('JACK_ASSISTANT_ID') || '',
      'mark-scout': Deno.env.get('MARK_ASSISTANT_ID') || '',
      'rose-dewitt-bukater': Deno.env.get('ROSE_ASSISTANT_ID') || '',
    };

    const assistantId = assistantMapping[characterId];
    if (!assistantId) {
      return new Response(
        JSON.stringify({ error: `No assistant configured for character: ${characterId}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // OpenAI API base URL
    const baseUrl = 'https://api.openai.com/v1';
    const headers = {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    };

    let currentThreadId = threadId;

    // Create thread if not provided
    if (!currentThreadId) {
      const threadResponse = await fetch(`${baseUrl}/threads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      if (!threadResponse.ok) {
        throw new Error(`Failed to create thread: ${threadResponse.statusText}`);
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
    }

    // Add message to thread
    const messageResponse = await fetch(`${baseUrl}/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      throw new Error(`Failed to add message: ${messageResponse.statusText}`);
    }

    // Run assistant
    const runResponse = await fetch(`${baseUrl}/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });

    if (!runResponse.ok) {
      throw new Error(`Failed to run assistant: ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for completion
    let runStatus = 'running';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (runStatus === 'running' || runStatus === 'queued' || runStatus === 'in_progress') {
      if (attempts >= maxAttempts) {
        throw new Error('Assistant response timeout');
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${baseUrl}/threads/${currentThreadId}/runs/${runId}`, {
        method: 'GET',
        headers,
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== 'completed') {
      throw new Error(`Assistant run failed with status: ${runStatus}`);
    }

    // Get messages
    const messagesResponse = await fetch(`${baseUrl}/threads/${currentThreadId}/messages`, {
      method: 'GET',
      headers,
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${messagesResponse.statusText}`);
    }

    const messagesData = await messagesResponse.json();
    const assistantMessages = messagesData.data.filter((msg: any) => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      throw new Error('No assistant response found');
    }

    const lastMessage = assistantMessages[0];
    const responseText = lastMessage.content[0]?.text?.value || 'I apologize, but I cannot provide a response right now.';

    const response: ChatResponse = {
      message: responseText,
      threadId: currentThreadId,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Chat function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});