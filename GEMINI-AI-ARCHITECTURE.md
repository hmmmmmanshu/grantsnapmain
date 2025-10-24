# Gemini AI Architecture - GrantSnap

## 📋 Overview

This document outlines the optimal AI model architecture for GrantSnap, balancing **cost, performance, and capabilities** across different use cases.

## 🎯 Core Principle: **Right Model for Right Task**

**Don't use a sledgehammer to crack a nut.** Use lighter, cheaper models for simple tasks and reserve powerful models for complex operations.

---

## 🏗️ Architecture Layers

### **Layer 1: Simple Context Generation** 
**Use Case**: Profile summarization, basic text generation, context aggregation

#### Model: `gemini-2.0-flash-exp`
- **Status**: ✅ FREE until March 2025
- **Rate Limits**: ✅ No limits on free tier
- **Speed**: ⚡ Very fast (~1-2 seconds)
- **Token Limits**: 1M input, 8K output
- **Cost (after free tier)**: $0.075 per 1M input tokens

#### Current Implementation:
```typescript
// supabase/functions/sync-user-context/index.ts
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`
)
```

#### Use Cases:
- ✅ User profile context summarization
- ✅ Executive summaries
- ✅ Key strengths extraction
- ✅ Simple recommendations
- ✅ Profile completeness analysis

---

### **Layer 2: Document Vision Analysis**
**Use Case**: PDF/PowerPoint pitch deck analysis, document understanding

#### Model: `gemini-1.5-flash` (with vision)
- **Status**: ✅ PAID (but very affordable)
- **Rate Limits**: Reasonable limits
- **Speed**: ⚡ Fast (~3-5 seconds)
- **Token Limits**: 1M input, 8K output
- **Cost**: $0.075 per 1M input tokens, $0.30 per 1M output tokens

#### Current Implementation:
```typescript
// supabase/functions/analyze-pitch-deck/index.ts
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
  {
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'application/pdf', data: base64File }}
        ]
      }]
    })
  }
)
```

#### Use Cases:
- ✅ Pitch deck analysis (PDF/PPTX)
- ✅ Document extraction
- ✅ Visual content understanding
- ✅ Multi-page document processing

---

### **Layer 3: Complex Form Filling & Deep Analysis** 🚀
**Use Case**: Chrome Extension autofill, grant application form filling, deep reasoning

#### Recommended Models (in order of preference):

#### Option A: `gemini-2.0-flash-thinking-exp` (BEST for reasoning)
- **Status**: ✅ FREE until March 2025
- **Capabilities**: Advanced reasoning, step-by-step thinking
- **Speed**: 🐢 Slower (~5-10 seconds) - uses extended thinking
- **Token Limits**: 32K input, 8K output
- **Cost (after free tier)**: $0.30 per 1M input tokens
- **Best For**: Complex multi-step form filling

#### Option B: `gemini-1.5-pro` (BEST for accuracy)
- **Status**: ✅ PAID
- **Capabilities**: Most accurate, best reasoning
- **Speed**: ⚡ Fast (~2-3 seconds)
- **Token Limits**: 2M input, 8K output
- **Cost**: $1.25 per 1M input tokens, $5.00 per 1M output tokens
- **Best For**: Critical accuracy requirements

#### Option C: `gemini-2.5-flash` (BEST for speed + accuracy balance)
- **Status**: ✅ PAID
- **Capabilities**: Latest model, balanced performance
- **Speed**: ⚡⚡ Very fast (~1-2 seconds)
- **Token Limits**: 1M input, 8K output
- **Cost**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Best For**: Production workloads with high volume

#### Future Implementation (Chrome Extension):
```typescript
// For form autofill in Chrome Extension
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are filling out a grant application form.
          
          **USER CONTEXT:**
          ${JSON.stringify(userContext)}
          
          **FORM FIELDS:**
          ${JSON.stringify(formFields)}
          
          **INSTRUCTIONS:**
          Fill each field with the most appropriate information from the user context.
          Use reasoning to match context to field requirements.
          Output as JSON mapping field_id to field_value.`
        }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower for accuracy
        maxOutputTokens: 4000,
        responseMimeType: 'application/json'
      }
    })
  }
)
```

#### Use Cases:
- 🎯 Chrome Extension form autofill
- 🎯 Multi-step grant applications
- 🎯 Complex eligibility analysis
- 🎯 Deep contextual matching
- 🎯 RAG-powered recommendations

---

## 💰 Cost Analysis

### Current Setup (After Free Tier Expires)

| Task | Model | Frequency | Cost/1K Requests | Monthly Cost (1K users) |
|------|-------|-----------|------------------|------------------------|
| Context Sync | gemini-2.0-flash-exp | 1/day/user | FREE (until Mar 2025) | $0 |
| Pitch Deck Analysis | gemini-1.5-flash | 1/user | ~$0.01 | $10 |
| Form Autofill | gemini-2.5-flash | 10/day/user | ~$0.50 | $500 |
| **TOTAL** | - | - | - | **~$510/month** |

### Optimized Setup (Using Free Tier Wisely)

| Task | Model | Frequency | Cost/1K Requests | Monthly Cost (1K users) |
|------|-------|-----------|------------------|------------------------|
| Context Sync | gemini-2.0-flash-exp | 1/day/user | FREE | $0 |
| Pitch Deck Analysis | gemini-1.5-flash | 1/user | ~$0.01 | $10 |
| Form Autofill | gemini-2.0-flash-thinking-exp | 10/day/user | FREE (until Mar 2025) | $0 |
| **TOTAL** | - | - | - | **~$10/month** |

**💡 Savings: $500/month by using free tier models strategically!**

---

## 🚀 Migration Plan

### Phase 1: Current (Completed ✅)
- [x] Context sync using `gemini-2.0-flash-exp` (FREE)
- [x] Pitch deck analysis using `gemini-1.5-flash` with vision
- [x] Deployed to production

### Phase 2: Chrome Extension (Next)
- [ ] Implement form autofill with `gemini-2.0-flash-thinking-exp`
- [ ] Add extended thinking for complex forms
- [ ] Test accuracy vs `gemini-1.5-pro`

### Phase 3: Production Optimization (Future)
- [ ] Monitor usage patterns
- [ ] A/B test different models for form filling
- [ ] Implement caching to reduce API calls
- [ ] Add fallback models for rate limiting

---

## 🎓 Best Practices

### 1. **Model Selection**
```
Simple task (< 500 tokens output)? 
  → Use gemini-2.0-flash-exp

Vision/Document task? 
  → Use gemini-1.5-flash

Complex reasoning (form filling)?
  → Use gemini-2.0-flash-thinking-exp (free) or gemini-2.5-flash (paid)

Critical accuracy needed?
  → Use gemini-1.5-pro
```

### 2. **Prompt Engineering**
- **Be specific**: Clear instructions = better output
- **Use JSON mode**: Set `responseMimeType: 'application/json'`
- **Lower temperature**: 0.2-0.4 for factual/structured outputs
- **Provide context**: More context = more accurate results

### 3. **Error Handling**
```typescript
try {
  const response = await callGemini()
  if (!response.ok) {
    // Log error details for debugging
    console.error('Gemini API Error:', await response.json())
    // Fallback to simpler model or cached response
  }
} catch (error) {
  // Handle network errors gracefully
  // Show user-friendly message
}
```

### 4. **Rate Limiting**
- Implement exponential backoff
- Cache frequent requests
- Batch similar requests
- Use webhooks for long-running tasks

---

## 🔧 Environment Variables

### Required in Supabase Edge Functions:
```bash
GEMINI_API_KEY=your_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### How to Add:
1. Go to Supabase Dashboard
2. Settings → Edge Functions → Environment Variables
3. Add `GEMINI_API_KEY` with your API key
4. Click "Save"

---

## 📊 Monitoring

### Key Metrics to Track:
1. **API Success Rate**: Should be > 99%
2. **Average Response Time**: < 5 seconds
3. **Token Usage**: Monitor input/output tokens
4. **Cost per User**: Track monthly spend
5. **Error Rate**: < 1% acceptable

### Tools:
- Gemini API Studio Dashboard (as shown in screenshot)
- Supabase Edge Function Logs
- Custom analytics in database

---

## 🎯 Recommendations

### For Current Phase (Free Tier):
✅ **Use gemini-2.0-flash-exp for everything simple**
- It's FREE until March 2025
- No rate limits
- Fast and reliable
- Perfect for context sync

✅ **Use gemini-1.5-flash for vision tasks**
- Affordable ($0.075 per 1M tokens)
- Direct document processing
- No text extraction needed

### For Future (After March 2025):
🔄 **Evaluate and choose**:
- If budget allows: Use `gemini-2.5-flash` for production
- If cost-sensitive: Continue with `gemini-2.0-flash-exp` (paid)
- If critical accuracy: Use `gemini-1.5-pro` selectively

### For Enterprise Scale:
💼 **Consider**:
- Google Cloud vertex AI for enterprise pricing
- Batch processing for non-real-time tasks
- Response caching layer
- CDN for static AI responses

---

## 🔗 Useful Links

- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Gemini Models Overview](https://ai.google.dev/gemini-api/docs/models)
- [Google AI Studio Dashboard](https://aistudio.google.com)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 📝 Summary

**Current Status**: ✅ **OPTIMIZED**
- Using FREE `gemini-2.0-flash-exp` for context sync
- Using affordable `gemini-1.5-flash` for pitch deck analysis
- Cost: **~$10/month for 1,000 users**
- Ready for Chrome Extension integration with free thinking model

**Next Steps**:
1. Test the updated context sync function ✅
2. Implement Chrome Extension with `gemini-2.0-flash-thinking-exp`
3. Monitor usage and costs
4. Scale as needed

---

*Last Updated: October 22, 2025*  
*Version: 3 (deployed)*  
*Status: Production Ready* 🚀

