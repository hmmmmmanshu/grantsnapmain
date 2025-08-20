# Refine AI Answer Edge Function

This Supabase Edge Function provides advanced AI-powered text refinement capabilities. It's designed to be an expert editor that can rewrite text according to specific styles while strictly adhering to word or character count limits.

## 🚀 Deployment

### Prerequisites
- Supabase CLI installed
- Authenticated with your Supabase project

### Deploy Command
```bash
supabase functions deploy refine-ai-answer
```

### Environment Variables
Make sure these are set in your Supabase project:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)

## 📡 API Endpoint

**URL**: `https://[PROJECT_REF].supabase.co/functions/v1/refine-ai-answer`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer [USER_JWT_TOKEN]
Content-Type: application/json
```

## 📝 Request Body

```json
{
  "original_answer": "Our solution helps businesses grow by providing tools and support.",
  "refinement_style": "persuasive",
  "question_context": "Describe how your solution benefits small businesses",
  "limit_object": {
    "type": "words",
    "value": 25
  }
}
```

### Required Fields
- `original_answer`: The text to be refined
- `refinement_style`: The style of refinement to apply
- `question_context`: The original question or context for the answer
- `limit_object`: Object containing limit type and value

### Limit Object Structure
- `type`: Either "words" or "characters"
- `value`: Positive number representing the maximum allowed

## 🎨 Available Refinement Styles

### 1. **persuasive** - Persuasive and Compelling
- Makes text more convincing and engaging
- Uses strong action verbs and emotional appeals
- Focuses on creating urgency and demonstrating value

### 2. **concise** - Concise and Clear
- Simplifies and clarifies text while maintaining impact
- Removes unnecessary words and uses simple language
- Gets straight to the point

### 3. **professional** - Professional and Formal
- Elevates tone to be more business-like and authoritative
- Uses industry terminology and maintains serious tone
- Demonstrates expertise and credibility

### 4. **creative** - Creative and Engaging
- Makes text more imaginative and memorable
- Uses vivid imagery, metaphors, and storytelling
- Maintains core message while adding creativity

### 5. **technical** - Technical and Detailed
- Adds technical depth and specificity
- Includes technical terms, methodologies, and data points
- Maintains clarity while adding technical detail

### 6. **casual** - Casual and Friendly
- Makes text more approachable and conversational
- Uses conversational language and contractions
- Maintains warm, approachable tone

## ✅ Response

### Success (200)
```json
{
  "success": true,
  "message": "Text refined successfully",
  "data": {
    "original_text": "Our solution helps businesses grow by providing tools and support.",
    "refined_text": "Our innovative solution revolutionizes business growth through powerful tools and comprehensive support.",
    "refinement_style": "persuasive",
    "question_context": "Describe how your solution benefits small businesses",
    "limit_object": {
      "type": "words",
      "value": 25
    },
    "original_counts": {
      "words": 12,
      "characters": 67
    },
    "final_counts": {
      "words": 15,
      "characters": 89
    },
    "validation": {
      "isValid": true,
      "current": 15,
      "limit": 25,
      "type": "words",
      "was_truncated": false
    },
    "ai_prompt_used": "Generated AI prompt content..."
  }
}
```

### Error Responses

#### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "Authorization header is required"
}
```

#### Bad Request (400)
```json
{
  "error": "Bad Request",
  "message": "All fields are required: original_answer, refinement_style, question_context, limit_object"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "details": "Error details here"
}
```

## 🔐 Authentication

The function requires a valid JWT token from Supabase Auth in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧠 AI Integration

### Current Implementation
The function currently uses mock responses for demonstration purposes. To integrate with real AI services:

1. **Replace the `callAIModel` function** with your preferred AI service
2. **Update environment variables** with your AI service API keys
3. **Customize the prompt engineering** for your specific use case

### Example AI Service Integration
```typescript
// OpenAI Integration Example
async function callAIModel(prompt: string, refinementStyle: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })
  
  const data = await response.json()
  return data.choices[0].message.content
}
```

## 🔒 Security Features

- **JWT Authentication**: Validates user tokens
- **Input Validation**: Comprehensive validation of all fields
- **CORS Support**: Configured for web application access
- **Error Handling**: Detailed error responses and logging
- **Rate Limiting**: Ready for implementation

## 🧪 Testing

### Using cURL
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/refine-ai-answer \
  -H "Authorization: Bearer [USER_JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "original_answer": "We help businesses grow.",
    "refinement_style": "persuasive",
    "question_context": "What does your company do?",
    "limit_object": {
      "type": "words",
      "value": 20
    }
  }'
```

### Using JavaScript
```javascript
const response = await fetch('https://[PROJECT_REF].supabase.co/functions/v1/refine-ai-answer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    original_answer: 'We help businesses grow.',
    refinement_style: 'persuasive',
    question_context: 'What does your company do?',
    limit_object: {
      type: 'words',
      value: 20
    }
  })
});

const result = await response.json();
```

## 🎯 Use Cases

### Grant Applications
- Refine answers to fit specific word limits
- Apply different styles for different sections
- Ensure professional tone while meeting constraints

### Business Proposals
- Adapt content for different audiences
- Maintain message consistency across formats
- Optimize for specific presentation lengths

### Content Marketing
- Repurpose content for different platforms
- Apply brand voice consistently
- Meet platform-specific character limits

## 🚧 Advanced Features

### Prompt Engineering
The function uses sophisticated prompt engineering to ensure:
- **Style Consistency**: Each refinement style has specific instructions
- **Context Awareness**: Original question context is preserved
- **Constraint Enforcement**: Hard limits are strictly enforced
- **Quality Output**: Professional, ready-to-use results

### Text Validation
- **Word/Character Counting**: Accurate measurement of text length
- **Limit Enforcement**: Automatic truncation if AI exceeds limits
- **Validation Reporting**: Detailed feedback on text constraints

### Error Handling
- **Graceful Degradation**: Fallback mechanisms for AI failures
- **User Feedback**: Clear error messages and suggestions
- **Logging**: Comprehensive logging for debugging

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the JWT token is valid and not expired
2. **400 Bad Request**: Ensure all required fields are provided with correct format
3. **500 Internal Server Error**: Check Supabase logs and environment variables

### Debug Logs
The function logs important events to the console:
- ✅ Successful text refinements
- ❌ Authentication errors
- ❌ Validation errors
- ❌ AI model errors
- ❌ Unexpected errors

Check your Supabase Edge Function logs for debugging information.

## 🔮 Future Enhancements

### Planned Features
- **Style Customization**: User-defined refinement styles
- **Batch Processing**: Multiple text refinements in single request
- **Quality Metrics**: AI-generated quality scores for refined text
- **Style Combinations**: Mix multiple refinement styles
- **Template Library**: Pre-built refinement templates for common use cases

### Integration Opportunities
- **Content Management Systems**: Direct integration with CMS platforms
- **Document Editors**: Real-time refinement suggestions
- **Form Applications**: Automatic answer optimization
- **Email Marketing**: Content refinement for campaigns
