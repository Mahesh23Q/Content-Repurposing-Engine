"""
Simple job processing service using Groq API directly
"""
import asyncio
import json
import re
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime
from loguru import logger
from groq import Groq

from db.repositories import JobRepository, ContentRepository, OutputRepository
from db.supabase import supabase_admin_client
from core.config import settings


class SimpleJobProcessor:
    """Process pending content repurposing jobs using Groq API directly"""
    
    def __init__(self):
        self.job_repo = JobRepository(supabase_admin_client)
        self.content_repo = ContentRepository(supabase_admin_client)
        self.output_repo = OutputRepository(supabase_admin_client)
        self.is_running = False
        
        # Configure Groq
        self.client = Groq(api_key=settings.GROQ_API_KEY)
    
    async def start(self):
        """Start the job processor"""
        self.is_running = True
        logger.info("Simple job processor started")
        
        while self.is_running:
            try:
                await self.process_pending_jobs()
                await asyncio.sleep(5)  # Check every 5 seconds
            except Exception as e:
                logger.error(f"Job processor error: {e}")
                await asyncio.sleep(10)  # Wait longer on error
    
    def stop(self):
        """Stop the job processor"""
        self.is_running = False
        logger.info("Simple job processor stopped")
    
    async def process_pending_jobs(self):
        """Process all pending jobs"""
        try:
            # Get pending jobs
            pending_jobs = await self.job_repo.get_pending_jobs(limit=5)
            
            if not pending_jobs:
                return
            
            logger.info(f"Processing {len(pending_jobs)} pending jobs")
            
            # Process each job
            for job in pending_jobs:
                try:
                    await self.process_job(job)
                except Exception as e:
                    logger.error(f"Error processing job {job['id']}: {e}")
                    await self.mark_job_failed(job["id"], str(e))
        
        except Exception as e:
            logger.error(f"Error getting pending jobs: {e}")
    
    async def process_job(self, job: Dict[str, Any]):
        """Process a single job"""
        job_id = job["id"]
        content_id = job["content_id"]
        
        logger.info(f"Processing job {job_id}")
        
        # Mark job as processing
        await self.job_repo.update(UUID(job_id), {
            "status": "processing",
            "started_at": datetime.utcnow().isoformat(),
            "current_step": "Loading content",
            "progress_percentage": 10
        })
        
        try:
            # Get content
            content = await self.content_repo.get_by_id(UUID(content_id))
            if not content:
                raise Exception(f"Content not found: {content_id}")
            
            # Update progress
            await self.job_repo.update(UUID(job_id), {
                "current_step": "Generating job title",
                "progress_percentage": 15
            })
            
            # Generate job title
            logger.info(f"Generating title for job {job_id}")
            job_title = await self.generate_job_title(content["original_text"], job["platforms"])
            logger.info(f"Generated title for job {job_id}: {job_title}")
            
            # Update job with title
            await self.job_repo.update(UUID(job_id), {
                "title": job_title,
                "current_step": "Analyzing content",
                "progress_percentage": 20
            })
            logger.info(f"Updated job {job_id} with title in database")
            
            # Analyze content
            analysis = await self.analyze_content(content["original_text"])
            
            # Process each platform
            platforms = job["platforms"]
            outputs = {}
            
            for i, platform in enumerate(platforms):
                progress = 30 + (i * 40 // len(platforms))
                await self.job_repo.update(UUID(job_id), {
                    "current_step": f"Generating {platform} content",
                    "progress_percentage": progress
                })
                
                if platform == "linkedin":
                    outputs[platform] = await self.generate_linkedin(content["original_text"], analysis)
                elif platform == "twitter":
                    outputs[platform] = await self.generate_twitter(content["original_text"], analysis)
                elif platform == "blog":
                    outputs[platform] = await self.generate_blog(content["original_text"], analysis)
                elif platform == "email":
                    outputs[platform] = await self.generate_email(content["original_text"], analysis)
            
            # Update progress
            await self.job_repo.update(UUID(job_id), {
                "current_step": "Saving outputs",
                "progress_percentage": 80
            })
            
            # Save outputs
            await self.save_outputs(job, content, outputs)
            
            # Calculate processing time
            start_time_str = job.get("started_at")
            if start_time_str:
                try:
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                    processing_time = (datetime.utcnow() - start_time.replace(tzinfo=None)).total_seconds()
                except (ValueError, AttributeError):
                    processing_time = 60  # Default fallback
            else:
                processing_time = 60  # Default fallback
            
            # Mark job as completed
            await self.job_repo.update(UUID(job_id), {
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": int(processing_time),
                "progress_percentage": 100,
                "current_step": "Completed"
            })
            
            logger.info(f"Job {job_id} completed successfully")
        
        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            await self.mark_job_failed(job_id, str(e))
    
    async def analyze_content(self, content: str) -> Dict[str, Any]:
        """Analyze content using Groq"""
        prompt = f"""
        Analyze this content and extract key information:
        
        Content: {content[:3000]}
        
        Provide a JSON response with:
        - key_insights: array of 3-5 main insights
        - tone: professional/casual/technical/inspirational
        - audience: target audience description
        - content_type: tutorial/opinion/case-study/news/guide
        
        Return only valid JSON, no other text.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=settings.GROQ_MAX_TOKENS
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    # Fallback
                    return {
                        "key_insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
                        "tone": "professional",
                        "audience": "general audience",
                        "content_type": "general"
                    }
        except Exception as e:
            logger.error(f"Content analysis error: {e}")
            return {
                "key_insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
                "tone": "professional",
                "audience": "general audience",
                "content_type": "general"
            }
    
    async def generate_job_title(self, content: str, platforms: List[str]) -> str:
        """Generate a descriptive job title based on content and platforms"""
        logger.info(f"Starting title generation for platforms: {platforms}")
        
        # Use intelligent fallback method as primary approach
        # This is more reliable than the AI which keeps producing thinking responses
        title = self._create_smart_title(content, platforms)
        logger.info(f"Generated title: '{title}' ({len(title)} chars)")
        return title
    
    def _create_smart_title(self, content: str, platforms: List[str]) -> str:
        """Create an intelligent title based on content analysis and platforms"""
        # Extract meaningful content keywords
        content_clean = content.strip().lower()
        
        # Look for key topics/themes in the content
        keywords = {
            'marketing': ['marketing', 'campaign', 'advertising', 'promotion', 'brand', 'seo'],
            'business': ['business', 'entrepreneur', 'startup', 'company', 'strategy', 'revenue'],
            'technology': ['technology', 'tech', 'ai', 'software', 'digital', 'automation'],
            'guide': ['guide', 'tutorial', 'how-to', 'step-by-step', 'instructions', 'comprehensive'],
            'tips': ['tips', 'advice', 'recommendations', 'best practices', 'insights', 'essential'],
            'analysis': ['analysis', 'research', 'study', 'report', 'findings'],
            'news': ['news', 'announcement', 'update', 'release', 'launch', 'breaking'],
            'case study': ['case study', 'example', 'success story', 'experience'],
            'review': ['review', 'evaluation', 'assessment', 'comparison']
        }
        
        # Find the most relevant topic
        topic_scores = {}
        for topic, terms in keywords.items():
            score = sum(1 for term in terms if term in content_clean)
            if score > 0:
                topic_scores[topic] = score
        
        # Get the top topic
        main_topic = max(topic_scores, key=topic_scores.get) if topic_scores else "content"
        
        # Extract first few meaningful words for context
        words = content.strip().split()[:12]
        stop_words = {'this', 'is', 'a', 'an', 'the', 'about', 'on', 'for', 'in', 'with', 'to', 'and', 'or', 'but', 'our', 'here', 'are'}
        
        meaningful_words = []
        for word in words:
            clean_word = word.lower().strip('.,!?;:"()[]{}')
            if clean_word not in stop_words and len(clean_word) > 2:
                meaningful_words.append(word)
            if len(meaningful_words) >= 4:
                break
        
        # Create content description
        if meaningful_words:
            # Take first 2-3 meaningful words
            content_desc = " ".join(meaningful_words[:3])
            # Capitalize first letter
            content_desc = content_desc[0].upper() + content_desc[1:] if content_desc else main_topic.title()
        else:
            content_desc = main_topic.title()
        
        # Add topic context if detected and not already in description
        if main_topic != "content" and main_topic.lower() not in content_desc.lower():
            if main_topic in ['guide', 'tips', 'analysis', 'news', 'review']:
                content_desc = f"{content_desc} {main_topic.title()}"
            elif main_topic == 'case study':
                content_desc = f"{content_desc} Case Study"
        
        # Limit content description length
        if len(content_desc) > 22:
            content_desc = content_desc[:19] + "..."
        
        # Create platform part
        if len(platforms) == 1:
            platform_part = f"for {platforms[0].title()}"
        elif len(platforms) == 2:
            platform_part = f"for {platforms[0].title()} & {platforms[1].title()}"
        elif len(platforms) == 3:
            platform_part = f"for {len(platforms)} Platforms"
        else:
            platform_part = "Multi-Platform"
        
        # Combine parts
        title = f"{content_desc} {platform_part}"
        
        # Ensure title fits within limit
        max_length = 40
        if len(title) > max_length:
            # Try shorter version
            if len(platforms) <= 2:
                short_platform = f"{platforms[0].title()}" if len(platforms) == 1 else f"{platforms[0].title()}+{platforms[1].title()}"
                title = f"{content_desc} for {short_platform}"
            else:
                title = f"{content_desc} Multi-Platform"
            
            # If still too long, truncate content description
            if len(title) > max_length:
                available_space = max_length - len(f" {platform_part}")
                if available_space > 5:
                    content_desc = content_desc[:available_space-3] + "..." if available_space > 8 else content_desc[:available_space]
                    title = f"{content_desc} {platform_part}"
                else:
                    title = f"Content {platform_part}"
        
        return title[:max_length]
    
    async def generate_linkedin(self, content: str, analysis: Dict) -> Dict[str, Any]:
        """Generate LinkedIn post"""
        insights = analysis.get("key_insights", [])[:3]
        
        prompt = f"""
        Create a professional LinkedIn post based on this content:
        
        Content: {content[:2000]}
        Key insights: {', '.join(insights)}
        Tone: {analysis.get('tone', 'professional')}
        
        Requirements:
        - Maximum 1300 characters
        - Professional tone
        - Include 3-5 hashtags
        - Include a call-to-action
        - Engaging opening
        
        Return only JSON: {{"post": "text", "hashtags": ["#tag1", "#tag2"], "cta": "action"}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=settings.GROQ_MAX_TOKENS
            )
            
            response_text = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    # Fallback
                    post_text = f"Key insights: {'. '.join(insights[:2])}. What are your thoughts?"
                    result = {
                        "post": post_text,
                        "hashtags": ["#business", "#insights", "#professional"],
                        "cta": "Share your thoughts!"
                    }
            
            result["character_count"] = len(result.get("post", ""))
            return result
            
        except Exception as e:
            logger.error(f"LinkedIn generation error: {e}")
            post_text = f"Key insights: {'. '.join(insights[:2])}. What are your thoughts?"
            return {
                "post": post_text,
                "hashtags": ["#business", "#insights"],
                "cta": "Share your thoughts!",
                "character_count": len(post_text)
            }
    
    async def generate_twitter(self, content: str, analysis: Dict) -> Dict[str, Any]:
        """Generate Twitter thread"""
        insights = analysis.get("key_insights", [])[:4]
        
        prompt = f"""
        Create a Twitter thread based on this content:
        
        Content: {content[:2000]}
        Key insights: {', '.join(insights)}
        
        Requirements:
        - 3-5 tweets
        - Each tweet max 280 characters
        - Engaging first tweet
        - Include hashtags
        
        Return only JSON: {{"tweets": [{{"number": 1, "text": "tweet text", "char_count": 150}}]}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=settings.GROQ_MAX_TOKENS
            )
            
            response_text = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    # Fallback
                    tweets = []
                    for i, insight in enumerate(insights[:3], 1):
                        tweet_text = f"{i}/{len(insights[:3])} {insight}"
                        tweets.append({
                            "number": i,
                            "text": tweet_text,
                            "char_count": len(tweet_text)
                        })
                    result = {"tweets": tweets}
            
            # Ensure char counts
            for tweet in result.get("tweets", []):
                if "char_count" not in tweet:
                    tweet["char_count"] = len(tweet.get("text", ""))
            
            return result
            
        except Exception as e:
            logger.error(f"Twitter generation error: {e}")
            tweets = []
            for i, insight in enumerate(insights[:3], 1):
                tweet_text = f"{i}/3 {insight}"
                tweets.append({
                    "number": i,
                    "text": tweet_text,
                    "char_count": len(tweet_text)
                })
            return {"tweets": tweets}
    
    async def generate_blog(self, content: str, analysis: Dict) -> Dict[str, Any]:
        """Generate blog post"""
        insights = analysis.get("key_insights", [])
        
        prompt = f"""
        Create a blog post based on this content:
        
        Content: {content[:3000]}
        Key insights: {', '.join(insights)}
        Tone: {analysis.get('tone', 'professional')}
        
        Requirements:
        - 500-700 words
        - SEO title
        - Meta description (150 chars)
        - Clear structure
        
        Return only JSON: {{"title": "title", "content": "blog content", "meta_description": "desc", "word_count": 600}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=settings.GROQ_MAX_TOKENS
            )
            
            response_text = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    # Fallback
                    blog_content = f"# Key Insights\n\n{chr(10).join([f'- {insight}' for insight in insights])}\n\nThese insights provide valuable perspective on the topic."
                    result = {
                        "title": "Key Insights and Analysis",
                        "content": blog_content,
                        "meta_description": "Discover key insights and analysis on this important topic.",
                        "word_count": len(blog_content.split())
                    }
            
            if "word_count" not in result:
                result["word_count"] = len(result.get("content", "").split())
            
            return result
            
        except Exception as e:
            logger.error(f"Blog generation error: {e}")
            blog_content = f"# Key Insights\n\n{chr(10).join([f'- {insight}' for insight in insights])}"
            return {
                "title": "Key Insights",
                "content": blog_content,
                "meta_description": "Key insights and analysis.",
                "word_count": len(blog_content.split())
            }
    
    async def generate_email(self, content: str, analysis: Dict) -> Dict[str, Any]:
        """Generate email sequence"""
        insights = analysis.get("key_insights", [])
        
        prompt = f"""
        Create a 3-email sequence based on this content:
        
        Content: {content[:2000]}
        Key insights: {', '.join(insights)}
        
        Requirements:
        - 3 emails with subjects and content
        - Email 1: Introduction (200-300 words)
        - Email 2: Main content (300-400 words)
        - Email 3: Call-to-action (200-300 words)
        
        Return only JSON: {{"emails": [{{"number": 1, "subject": "subject", "content": "email content", "word_count": 250}}]}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=settings.GROQ_MAX_TOKENS
            )
            
            response_text = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    # Fallback
                    emails = [
                        {
                            "number": 1,
                            "subject": "Introduction to Key Insights",
                            "content": f"Hello! I wanted to share some key insights: {insights[0] if insights else 'Important information'}",
                            "word_count": 50
                        },
                        {
                            "number": 2,
                            "subject": "Deep Dive Analysis",
                            "content": f"Let's explore further: {'. '.join(insights[:2])}",
                            "word_count": 75
                        },
                        {
                            "number": 3,
                            "subject": "Take Action",
                            "content": "Ready to implement these insights? Let's connect and discuss next steps.",
                            "word_count": 40
                        }
                    ]
                    result = {"emails": emails}
            
            # Ensure word counts
            for email in result.get("emails", []):
                if "word_count" not in email:
                    email["word_count"] = len(email.get("content", "").split())
            
            return result
            
        except Exception as e:
            logger.error(f"Email generation error: {e}")
            return {
                "emails": [
                    {
                        "number": 1,
                        "subject": "Key Insights",
                        "content": f"Key insight: {insights[0] if insights else 'Important information'}",
                        "word_count": 20
                    }
                ]
            }
    
    async def save_outputs(self, job: Dict[str, Any], content: Dict[str, Any], outputs: Dict[str, Any]):
        """Save generated outputs to database"""
        job_id = job["id"]
        content_id = content["id"]
        user_id = job["user_id"]
        
        for platform, output in outputs.items():
            if output:
                try:
                    # Calculate quality score
                    quality_score = self._calculate_quality_score(output, platform)
                    
                    # Create output record
                    await self.output_repo.create({
                        "job_id": job_id,
                        "content_id": content_id,
                        "user_id": user_id,
                        "platform": platform,
                        "content": output,
                        "quality_score": quality_score,
                        "validation_results": {"status": "generated"},
                        "generation_metadata": {
                            "processor": "simple_groq",
                            "model": settings.GROQ_MODEL
                        }
                    })
                    
                    logger.info(f"Saved {platform} output for job {job_id}")
                
                except Exception as e:
                    logger.error(f"Error saving {platform} output: {e}")
    
    def _calculate_quality_score(self, output: Dict[str, Any], platform: str) -> float:
        """Calculate quality score for output"""
        score = 1.0
        
        # Basic completeness check
        required_fields = {
            "linkedin": ["post", "hashtags"],
            "twitter": ["tweets"],
            "blog": ["title", "content"],
            "email": ["emails"]
        }
        
        for field in required_fields.get(platform, []):
            if field not in output or not output[field]:
                score -= 0.2
        
        return max(0.0, min(1.0, score))
    
    async def mark_job_failed(self, job_id: str, error_message: str):
        """Mark job as failed"""
        try:
            await self.job_repo.update(UUID(job_id), {
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "error_message": error_message,
                "progress_percentage": 0
            })
        except Exception as e:
            logger.error(f"Error marking job as failed: {e}")


# Global job processor instance
simple_job_processor = SimpleJobProcessor()


async def start_simple_job_processor():
    """Start the simple job processor"""
    await simple_job_processor.start()


def stop_simple_job_processor():
    """Stop the simple job processor"""
    simple_job_processor.stop()