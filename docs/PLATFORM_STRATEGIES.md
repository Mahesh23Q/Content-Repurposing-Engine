# Platform-Specific Generation Strategies

## Overview

Each platform has unique characteristics, audience expectations, and best practices. This document details the strategy for generating optimized content for each platform.

## Platform Comparison Matrix

| Platform | Length | Tone | Structure | Key Elements |
|----------|--------|------|-----------|--------------|
| LinkedIn | 1300 chars | Professional | Hook + Body + CTA | Hashtags, Line breaks |
| Twitter/X | 280/tweet | Conversational | Thread (3-7) | Hook, Numbered |
| Blog | 500-700 words | Informative | Headers + Sections | SEO, Structure |
| Email | 3-5 emails | Personal | Sequence | Story arc, Curiosity |
| Instagram | 2200 chars | Visual-first | Caption | Emojis, Hashtags |
| YouTube | 5000 chars | Descriptive | Timestamps | Keywords, Links |

---

## 1. LinkedIn Strategy

### Platform Characteristics

- **Audience**: Professionals, decision-makers, thought leaders
- **Content Types**: Insights, case studies, career advice, industry trends
- **Engagement**: Comments and shares valued over likes
- **Algorithm**: Favors engagement in first hour, dwell time

### Best Practices

#### Hook (First 2 Lines)
The first ~150 characters appear before "see more" - this is critical.

**Effective Hook Patterns**:

1. **Question Hook**
   ```
   Want to know why 73% of startups fail in their first year?
   It's not what you think.
   ```

2. **Stat Hook**
   ```
   I analyzed 1,000 LinkedIn posts.
   Only 3% got meaningful engagement. Here's why:
   ```

3. **Bold Statement**
   ```
   Everything you know about productivity is wrong.
   I learned this the hard way after burning out twice.
   ```

4. **Story Hook**
   ```
   3 years ago, I made a $50K mistake.
   Today, I'm grateful it happened.
   ```

5. **Contrarian Hook**
   ```
   Stop following your passion.
   Follow your curiosity instead. Here's why:
   ```

#### Body Structure

Use line breaks for scannability:

```
[Hook - 1-2 lines]

[Context/Problem - 2-3 lines]

[Main Points - Use one of these formats:]

Format A - Numbered List:
1. Point one with brief explanation
2. Point two with brief explanation
3. Point three with brief explanation

Format B - Bullet Points:
→ Point one
→ Point two
→ Point three

Format C - Sections:
The Problem:
[2-3 lines]

The Solution:
[2-3 lines]

The Result:
[2-3 lines]

[Insight/Lesson - 2-3 lines]

[CTA - 1-2 lines]

#Hashtag1 #Hashtag2 #Hashtag3
```

#### Hashtag Strategy

- **Quantity**: 3-5 hashtags (optimal)
- **Placement**: End of post
- **Mix**: 1 broad + 2-3 specific + 1 niche
- **Research**: Use LinkedIn's hashtag suggestions

**Example Mix**:
```
#Leadership (broad - 5M+ followers)
#RemoteWork (specific - 500K followers)
#EngineeringManagement (specific - 100K followers)
#DevOps (niche - 50K followers)
```

#### CTA Patterns

1. **Engagement CTA**
   ```
   What's your experience with this? Share in comments.
   ```

2. **Resource CTA**
   ```
   Want the full framework? Link in comments.
   ```

3. **Connection CTA**
   ```
   Follow for more insights on [topic].
   ```

4. **Discussion CTA**
   ```
   Agree or disagree? Let's discuss below.
   ```

### Generation Prompt Template

```python
LINKEDIN_PROMPT = """
Create a LinkedIn post from this content.

Original Content:
{content}

Key Insights:
{insights}

Tone: {tone}
Target Audience: {audience}

Requirements:
1. Hook (first 2 lines, <150 chars) - use one of these patterns:
   - Question that creates curiosity
   - Surprising statistic
   - Bold/contrarian statement
   - Personal story opening

2. Body:
   - Use line breaks every 2-3 lines
   - Include 3-5 main points
   - Use numbered list or bullets
   - Professional but conversational tone
   - Include specific examples or data

3. Closing:
   - Key insight or lesson learned
   - Clear CTA

4. Hashtags:
   - Exactly 3-5 hashtags
   - Mix of broad and specific
   - Relevant to content

5. Constraints:
   - Maximum 1300 characters
   - Maintain core message
   - Natural, not robotic

Output as JSON:
{{
    "post": "full post text with line breaks",
    "hashtags": ["tag1", "tag2", "tag3"],
    "character_count": 1250,
    "hook": "the hook used",
    "cta": "the call to action",
    "estimated_engagement": "high/medium/low"
}}
"""
```

### Quality Checklist

- [ ] Hook is compelling and under 150 characters
- [ ] Line breaks every 2-3 lines
- [ ] 3-5 hashtags included
- [ ] Clear CTA present
- [ ] Total length ≤ 1300 characters
- [ ] Professional yet conversational tone
- [ ] Core message preserved
- [ ] Specific examples or data included

---

## 2. Twitter/X Thread Strategy

### Platform Characteristics

- **Audience**: Fast-paced, diverse, news-oriented
- **Content Types**: Quick insights, threads, commentary, breaking news
- **Engagement**: Retweets and replies drive reach
- **Algorithm**: Favors engagement velocity, recency

### Thread Structure

**Optimal Length**: 3-7 tweets
- Too short (1-2): Lacks depth
- Too long (10+): Loses readers

**Numbering Format**: "1/7", "2/7", etc.
- Helps readers track progress
- Signals thread length upfront

### Tweet-by-Tweet Strategy

#### Tweet 1: The Hook
This is the most important tweet - determines if people read the thread.

**Hook Patterns**:

1. **The Promise**
   ```
   I spent 5 years studying successful founders.
   
   Here are the 7 habits they all share:
   ```

2. **The Stat**
   ```
   73% of developers quit their first startup.
   
   I was one of them. Here's what I learned:
   ```

3. **The Question**
   ```
   Why do some products go viral while others fail?
   
   I analyzed 100 launches. The pattern is clear:
   ```

4. **The Story**
   ```
   My startup failed. I lost $200K.
   
   But it taught me more than any success could:
   ```

5. **The Contrarian**
   ```
   Everyone says "follow your passion."
   
   That's terrible advice. Here's why:
   ```

#### Tweet 2: Context/Setup
Provide background or frame the problem.

```
2/7 Most people think [common belief].

But after [experience/research], I discovered [insight].

Here's the breakdown:
```

#### Tweets 3-6: Main Points
One clear idea per tweet.

**Structure**:
```
3/7 Point #1: [Headline]

[2-3 sentences explaining]

[Optional: Quick example]
```

**Tips**:
- Use simple language
- One idea per tweet
- Include examples when possible
- Use emojis sparingly (1-2 per tweet max)

#### Final Tweet: Conclusion + CTA

```
7/7 Summary:
• Point 1
• Point 2
• Point 3

[CTA: Follow, link, question, etc.]
```

### Character Optimization

**Target**: 240-260 characters per tweet
- Leaves room for retweets with comments
- Easier to read on mobile
- Better engagement

**Techniques**:
- Use contractions (don't vs do not)
- Remove filler words (very, really, just)
- Use symbols (→ instead of "leads to")
- Break long sentences

### Generation Prompt Template

```python
TWITTER_PROMPT = """
Create a Twitter/X thread from this content.

Original Content:
{content}

Key Insights:
{insights}

Best Hooks:
{hooks}

Tone: {tone}

Requirements:
1. Thread Length: 3-7 tweets

2. Tweet 1 (Hook):
   - Compelling opening
   - Promise value or insight
   - Make them want to read more
   - Use one of: question, stat, story, promise, contrarian

3. Tweet 2 (Context):
   - Set up the problem or background
   - Transition to main content

4. Tweets 3-N (Main Points):
   - One clear idea per tweet
   - Include examples or data
   - Conversational tone
   - 240-260 characters each

5. Final Tweet (Conclusion):
   - Summarize key points
   - Clear CTA (follow, link, question)

6. Format:
   - Numbered: "1/7", "2/7", etc.
   - Max 280 characters per tweet
   - Natural, conversational language

Output as JSON:
{{
    "tweets": [
        {{
            "number": "1/7",
            "text": "tweet content",
            "char_count": 245,
            "purpose": "hook"
        }},
        ...
    ],
    "total_tweets": 7,
    "thread_summary": "brief summary",
    "estimated_engagement": "high/medium/low"
}}
"""
```

### Quality Checklist

- [ ] Hook is compelling and clear
- [ ] 3-7 tweets total
- [ ] Numbered format (1/X, 2/X)
- [ ] Each tweet ≤ 280 characters
- [ ] One idea per tweet
- [ ] Final tweet has CTA
- [ ] Conversational tone
- [ ] Core message preserved

---

## 3. Blog Post Strategy

### Platform Characteristics

- **Audience**: Information seekers, researchers
- **Content Types**: How-tos, guides, analysis, opinions
- **Engagement**: Time on page, scroll depth
- **SEO**: Critical for discoverability

### Structure

```
# Title (H1)
[60-70 characters, includes primary keyword]

## Introduction (H2)
[Hook + Context + Preview of what's covered]
[150-200 words]

## Main Section 1 (H2)
[Primary point with keyword]

### Subsection 1.1 (H3)
[Detail or example]

### Subsection 1.2 (H3)
[Detail or example]

## Main Section 2 (H2)
[Secondary point with keyword]

[Content with examples, data, quotes]

## Main Section 3 (H2)
[Tertiary point with keyword]

[Content with actionable advice]

## Conclusion (H2)
[Summary + Key takeaways + CTA]
[100-150 words]
```

### SEO Optimization

#### Keyword Strategy

**Primary Keyword**: Main topic (e.g., "content marketing strategy")
- Title (H1)
- First paragraph
- At least one H2
- Meta description
- URL slug

**Secondary Keywords**: Related terms (e.g., "content planning", "marketing tactics")
- H2 and H3 headers
- Throughout body
- Image alt text

**LSI Keywords**: Semantic variations
- Natural placement in content

#### Title Optimization

**Patterns**:
1. How-to: "How to [Achieve Result] in [Timeframe]"
2. List: "[Number] Ways to [Achieve Result]"
3. Guide: "The Complete Guide to [Topic]"
4. Comparison: "[Option A] vs [Option B]: Which is Better?"
5. Question: "Why [Common Question]?"

**Examples**:
- "How to Write LinkedIn Posts That Get 10x Engagement"
- "7 Content Repurposing Strategies That Save 10 Hours/Week"
- "The Complete Guide to Twitter Threads in 2024"

#### Meta Description

- **Length**: 150-160 characters
- **Include**: Primary keyword, value proposition, CTA
- **Example**: "Learn how to repurpose content across platforms. Save time while increasing reach. Step-by-step guide with examples."

### Content Structure Best Practices

#### Introduction Formula

```
[Hook - 1 sentence that grabs attention]

[Problem - 2-3 sentences describing the pain point]

[Solution Preview - 1-2 sentences on what they'll learn]

[Credibility - Optional: Why you're qualified to write this]
```

**Example**:
```
Content creation is exhausting. You spend hours writing a blog post, 
only to realize you need completely different versions for LinkedIn, 
Twitter, and email.

What if you could create once and repurpose intelligently across all 
platforms? In this guide, you'll learn the exact system I use to turn 
one piece of content into 10+ platform-optimized versions.

I've used this approach to grow my audience to 50K+ across platforms 
while spending 50% less time on content creation.
```

#### Body Content

**Paragraph Length**: 2-4 sentences
- Improves readability
- Better for mobile
- Increases scroll depth

**Use of Examples**:
- Include at least one example per main section
- Use real data when possible
- Show before/after comparisons

**Visual Elements**:
- Break up text every 300-400 words
- Use: images, quotes, code blocks, lists
- Add descriptive alt text

#### Conclusion Formula

```
[Summary - Recap main points in 2-3 sentences]

[Key Takeaway - The one thing they should remember]

[CTA - What to do next]
```

### Generation Prompt Template

```python
BLOG_PROMPT = """
Create a condensed blog post (500-700 words) from this content.

Original Content:
{content}

Key Insights:
{insights}

Tone: {tone}
Primary Keyword: {keyword}

Requirements:
1. Title (H1):
   - 60-70 characters
   - Include primary keyword
   - Compelling and clear

2. Introduction (150-200 words):
   - Hook that grabs attention
   - Problem statement
   - Preview of content
   - Optional: Credibility statement

3. Body (300-400 words):
   - 2-3 main sections (H2)
   - Use H3 for subsections
   - Include examples or data
   - 2-4 sentences per paragraph
   - Natural keyword placement

4. Conclusion (100-150 words):
   - Summarize key points
   - Main takeaway
   - Clear CTA

5. SEO Elements:
   - Meta description (150-160 chars)
   - Primary keyword in title, first paragraph, one H2
   - Secondary keywords in headers
   - Internal linking suggestions

6. Formatting:
   - Use markdown headers
   - Bullet points or numbered lists
   - Bold for emphasis (sparingly)

Output as JSON:
{{
    "title": "SEO-optimized title",
    "meta_description": "150-160 char description",
    "content": "full blog post with markdown",
    "word_count": 650,
    "keywords": {{
        "primary": "main keyword",
        "secondary": ["keyword1", "keyword2"]
    }},
    "internal_links": ["suggested link 1", "suggested link 2"],
    "readability_score": 65
}}
"""
```

### Quality Checklist

- [ ] Title includes primary keyword
- [ ] 500-700 words
- [ ] Clear header structure (H2, H3)
- [ ] Introduction has hook and preview
- [ ] Body has 2-3 main sections
- [ ] Examples or data included
- [ ] Conclusion summarizes and has CTA
- [ ] Meta description 150-160 characters
- [ ] Readability score 60-70 (Flesch)
- [ ] Core message preserved

---

## 4. Email Sequence Strategy

### Platform Characteristics

- **Audience**: Subscribers, warm leads
- **Content Types**: Nurture, education, sales
- **Engagement**: Open rate, click rate, replies
- **Goal**: Build relationship, drive action

### Sequence Structure

**3-Email Sequence** (Recommended for content repurposing):

```
Email 1: Hook + Problem
↓ (24-48 hours)
Email 2: Story + Mistake
↓ (24-48 hours)
Email 3: Solution + Framework
```

**5-Email Sequence** (For deeper content):

```
Email 1: Hook + Problem
↓
Email 2: Why It Matters
↓
Email 3: Common Mistakes
↓
Email 4: Solution Framework
↓
Email 5: Case Study + CTA
```

### Email-by-Email Strategy

#### Email 1: Hook + Problem

**Goal**: Grab attention, establish problem

**Subject Line Patterns**:
- Question: "Why do 73% of startups fail?"
- Curiosity: "The $150 mistake that ruins marathons"
- Personal: "I made this mistake (so you don't have to)"
- Urgency: "Before you [action], read this"

**Body Structure**:
```
[Personal greeting]

[Hook - 1-2 sentences]

[Problem description - 3-4 sentences]

[Tease solution - 1-2 sentences]

[CTA: "Tomorrow I'll share..."]

[Signature]
```

**Example**:
```
Subject: The $150 mistake that ruins marathons

Hey [Name],

You've committed. 16 weeks of training ahead.

But before you lace up, there's one decision that determines whether 
you cross the finish line or limp home with an injury.

Your shoes.

73% of first-time marathoners get this wrong. I did too, and it cost 
me 6 months of recovery.

Tomorrow, I'll share the 3 specific mistakes I made—and how to avoid them.

Talk soon,
[Your Name]
```

#### Email 2: Story + Mistake

**Goal**: Build connection through vulnerability, increase curiosity

**Subject Line**: Reference Email 1
- "The 3 shoe mistakes that cost me 6 months"
- "Here's what happened (Email 1 follow-up)"
- "Remember yesterday's email? Here's the story"

**Body Structure**:
```
[Reference to Email 1]

[Personal story - 4-5 sentences]

[The mistakes - 3 bullet points]

[Consequence - 2-3 sentences]

[Lesson learned - 1-2 sentences]

[Tease next email - 1-2 sentences]

[Signature]
```

#### Email 3: Solution + Framework

**Goal**: Deliver value, drive action

**Subject Line**: Deliver on promise
- "Your marathon shoe selection framework"
- "How to choose the right shoes (step-by-step)"
- "The framework that fixed everything"

**Body Structure**:
```
[Quick recap]

[The Framework - clear steps or principles]

[Example or case study]

[How to implement]

[Strong CTA]

[Signature]
```

### Subject Line Best Practices

**Length**: 40-50 characters (mobile optimization)

**Patterns That Work**:
1. **Curiosity Gap**: "The one thing I wish I knew..."
2. **Specificity**: "3 mistakes that cost me $50K"
3. **Personal**: "I tried this for 30 days. Here's what happened"
4. **Question**: "Are you making this mistake?"
5. **Urgency**: "Before you [action]..."

**Avoid**:
- ALL CAPS
- Excessive punctuation!!!
- Spam trigger words (free, guarantee, act now)
- Misleading claims

### Preview Text Optimization

The preview text (first ~90 characters) appears next to subject line.

**Strategy**: Complement subject line, don't repeat it

**Example**:
- Subject: "The $150 mistake that ruins marathons"
- Preview: "73% of first-time marathoners make this choice. Here's how to avoid it."

### Generation Prompt Template

```python
EMAIL_PROMPT = """
Create a 3-email sequence from this content.

Original Content:
{content}

Key Insights:
{insights}

Tone: {tone}

Requirements:
1. Email 1 (Hook + Problem):
   - Subject: Curiosity-driven (40-50 chars)
   - Preview text: Complement subject
   - Body: Hook, problem, tease solution
   - Length: 100-150 words
   - CTA: "Tomorrow I'll share..."

2. Email 2 (Story + Mistake):
   - Subject: Reference Email 1
   - Body: Personal story, mistakes made
   - Length: 150-200 words
   - CTA: "Next email: The solution"

3. Email 3 (Solution + Framework):
   - Subject: Deliver on promise
   - Body: Framework, example, implementation
   - Length: 200-250 words
   - CTA: Strong action (download, read, try)

4. Sequence Flow:
   - Build curiosity between emails
   - Progressive value delivery
   - Maintain consistent voice
   - Personal, conversational tone

5. Timing:
   - Suggest 24-48 hour gaps

Output as JSON:
{{
    "emails": [
        {{
            "sequence_number": 1,
            "subject": "...",
            "preview_text": "...",
            "body": "...",
            "word_count": 120,
            "cta": "...",
            "send_delay_hours": 0
        }},
        ...
    ],
    "sequence_summary": "brief overview",
    "estimated_open_rate": "high/medium/low"
}}
"""
```

### Quality Checklist

- [ ] 3 emails in sequence
- [ ] Subject lines 40-50 characters
- [ ] Preview text complements subject
- [ ] Email 1: Hook + Problem + Tease
- [ ] Email 2: Story + Mistakes
- [ ] Email 3: Solution + Framework
- [ ] Curiosity gaps between emails
- [ ] Progressive value delivery
- [ ] Personal, conversational tone
- [ ] Clear CTAs in each email
- [ ] Core message preserved

---

## 5. Instagram Strategy (Optional)

### Platform Characteristics

- **Audience**: Visual-first, younger demographic
- **Content Types**: Lifestyle, inspiration, behind-the-scenes
- **Engagement**: Likes, saves, shares
- **Algorithm**: Favors saves and shares over likes

### Caption Structure

```
[Hook - 1-2 lines]

[Main content - 5-10 lines with line breaks]

[CTA]

[Hashtags - 20-30, separated or in first comment]
```

### Best Practices

- **Length**: 1000-2200 characters
- **Line breaks**: Every 1-2 lines
- **Emojis**: 3-5 throughout caption
- **Hashtags**: 20-30 (mix of sizes)
- **CTA**: Tag a friend, save for later, share

---

## 6. YouTube Description Strategy (Optional)

### Structure

```
[Hook paragraph - 2-3 sentences]

[Timestamps]
0:00 - Introduction
1:30 - Point 1
3:45 - Point 2
...

[Detailed description - 200-300 words]

[Links]
- Resource 1: [URL]
- Resource 2: [URL]

[About section]

[Hashtags - 3-5]
```

### Best Practices

- **Length**: 200-5000 characters
- **Keywords**: First 2-3 sentences
- **Timestamps**: Improve watch time
- **Links**: Drive traffic
- **Hashtags**: 3-5 relevant tags

---

## Cross-Platform Consistency

### Core Message Preservation

Across all platforms, maintain:
1. **Main thesis**: The central argument
2. **Key insights**: 3-5 core points
3. **Tone**: Consistent voice
4. **Value proposition**: Why it matters

### Platform Adaptation

What changes:
1. **Length**: Adjusted to platform norms
2. **Structure**: Format for platform
3. **Language**: Formality level
4. **Visual elements**: Platform-specific

### Quality Metrics

Track these across platforms:
- **Engagement rate**: Likes, comments, shares
- **Click-through rate**: Link clicks
- **Save rate**: Bookmarks, saves
- **Conversion rate**: Desired action taken

---

This comprehensive platform strategy ensures content is truly optimized for each channel while maintaining the core message and value.
