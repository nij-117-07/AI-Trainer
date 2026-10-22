import dspy
from typing import Optional, List, Dict, Any, Literal

# 1. Define the Signature
class ResourceSuggestor(dspy.Signature):
    """
    You are an expert Learning Resource Advisor. Your role is to analyze a learner's
    current background and their target learning topic, then provide personalized,
    high-quality resource recommendations.
    
    Consider the learner's existing knowledge to suggest resources that:
    - Bridge the gap between their current level and the target topic
    - Match their preferred learning style and constraints
    - Progress from foundational to advanced as needed
    - Include diverse resource types for comprehensive learning
    
    Provide actionable, specific resources with clear reasoning for each recommendation.
    """
    
    # Input Fields
    background_subject: str = dspy.InputField(
        description="The subject or domain the user is currently studying or has background knowledge in."
    )
    target_topic: str = dspy.InputField(
        description="The specific topic or skill the user wants to learn."
    )
    additional_preferences: Optional[str] = dspy.InputField(
        default=None,
        description="Optional preferences like learning style (visual/auditory/reading), "
                   "time commitment (hours per week), difficulty preference (beginner/intermediate/advanced), "
                   "format preference (free/paid, video/text/interactive), language, or any other constraints."
    )
    
    # Output Fields
    learning_path_summary: str = dspy.OutputField(
        description="A brief overview of the recommended learning approach and progression strategy."
    )
    recommended_resources: List[Dict[str, str]] = dspy.OutputField(
        description="""
        A list of 5-8 curated learning resources. Each resource must include:
        - 'title': The exact name of the resource
        - 'type': Category (book, youtube_video, blog_post, online_course, documentation, podcast, github_repo, paper)
        - 'author_or_creator': Who created it (if known)
        - 'description': What the resource covers and its key focus
        - 'difficulty_level': beginner, intermediate, or advanced
        - 'estimated_time': Approximate time to complete (e.g., '3 hours', '2 weeks')
        - 'why_recommended': Specific reason this resource fits the learner's background and goals
        - 'prerequisite_knowledge': What they should know before starting this resource
        - 'access_info': How to access it (URL if known, platform name, or 'search for: [title]')
        """
    )
    next_steps: str = dspy.OutputField(
        description="Suggested order to consume the resources and what to do after completing them."
    )

# 2. Execution Function
def execute_resource_suggestor(
    model_name: str,
    api_key: str,
    api_base: str,
    background_subject: str,
    target_topic: str,
    additional_preferences: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute the Resource Suggestor to get personalized learning resource recommendations.
    
    Args:
        model_name: The LLM model to use (e.g., 'gpt-4-turbo')
        api_key: API key for the model
        api_base: Base URL for the API endpoint
        background_subject: User's current background/subject they're learning
        target_topic: The topic they want to learn
        additional_preferences: Optional learning preferences and constraints
    
    Returns:
        Dictionary containing learning path summary, recommended resources, and next steps
    """
    
    # Configure the LM within the context
    with dspy.context(lm=dspy.LM(
            model=f'openai/{model_name}',
            api_key=api_key,
            api_base=api_base,
            temperature=0.7,  # Slightly higher for creative recommendations
            stop=None,
            cache=False
        )):
        
        # Instantiate the predictor
        # Using ChainOfThought for better reasoning about resource selection
        suggestor = dspy.ChainOfThought(ResourceSuggestor)
        
        # Call the predictor
        response = suggestor(
            background_subject=background_subject,
            target_topic=target_topic,
            additional_preferences=additional_preferences or "No specific preferences provided."
        )
        
        # Parse and structure the response
        result = {
            "learning_path_summary": response.learning_path_summary,
            "recommended_resources": response.recommended_resources,
            "next_steps": response.next_steps
        }
        
        return result

# 3. Usage Examples
if __name__ == "__main__":
    # Configuration

    # Example 1: Beginner transitioning to a new field
    print("=" * 80)
    print("Example 1: Learning Machine Learning with Python background")
    print("=" * 80)
    
    result1 = execute_resource_suggestor(
        **config,
        background_subject="Python programming and basic statistics",
        target_topic="Machine Learning and Deep Learning",
        additional_preferences="I prefer video tutorials and hands-on projects. I can dedicate 10 hours per week. Looking for free resources initially."
    )
    
    print(f"\n📚 Learning Path Summary:\n{result1['learning_path_summary']}\n")
    print(f"🎯 Recommended Resources:")
    for i, resource in enumerate(result1['recommended_resources'], 1):
        print(f"\n  {i}. {resource['title']}")
        print(f"     Type: {resource['type']}")
        print(f"     Creator: {resource['author_or_creator']}")
        print(f"     Difficulty: {resource['difficulty_level']}")
        print(f"     Time: {resource['estimated_time']}")
        print(f"     Description: {resource['description']}")
        print(f"     Why Recommended: {resource['why_recommended']}")
        print(f"     Prerequisites: {resource['prerequisite_knowledge']}")
        print(f"     Access: {resource['access_info']}")
    
    print(f"\n🚀 Next Steps:\n{result1['next_steps']}\n")
    
    # Example 2: Professional upskilling
    print("\n" + "=" * 80)
    print("Example 2: Web Developer learning Cloud Architecture")
    print("=" * 80)
    
    result2 = execute_resource_suggestor(
        **config,
        background_subject="Full-stack web development with JavaScript and Node.js",
        target_topic="Cloud Architecture and AWS Services",
        additional_preferences="I learn best through documentation and real-world case studies. Need to get certified within 3 months. Prefer structured courses."
    )
    
    print(f"\n📚 Learning Path Summary:\n{result2['learning_path_summary']}\n")
    print(f"🎯 Recommended Resources:")
    for i, resource in enumerate(result2['recommended_resources'], 1):
        print(f"\n  {i}. {resource['title']}")
        print(f"     Type: {resource['type']}")
        print(f"     Creator: {resource['author_or_creator']}")
        print(f"     Difficulty: {resource['difficulty_level']}")
        print(f"     Time: {resource['estimated_time']}")
        print(f"     Description: {resource['description']}")
        print(f"     Why Recommended: {resource['why_recommended']}")
        print(f"     Prerequisites: {resource['prerequisite_knowledge']}")
        print(f"     Access: {resource['access_info']}")
    
    print(f"\n🚀 Next Steps:\n{result2['next_steps']}\n")
    
    # Example 3: Academic research
    print("\n" + "=" * 80)
    print("Example 3: Biology student learning Bioinformatics")
    print("=" * 80)
    
    print("\n" + "=" * 80)
    print("Example 3: Biology student learning Bioinformatics")
    print("=" * 80)
    
    result3 = execute_resource_suggestor(
        **config,
        background_subject="Molecular biology and genetics",
        target_topic="Bioinformatics and computational genomics",
        additional_preferences="I need academic papers and textbooks. Limited programming experience but willing to learn. University access available."
    )
    
    print(f"\n📚 Learning Path Summary:\n{result3['learning_path_summary']}\n")
    print(f"🎯 Recommended Resources:")
    for i, resource in enumerate(result3['recommended_resources'], 1):
        print(f"\n  {i}. {resource['title']}")
        print(f"     Type: {resource['type']}")
        print(f"     Creator: {resource['author_or_creator']}")
        print(f"     Difficulty: {resource['difficulty_level']}")
        print(f"     Time: {resource['estimated_time']}")
        print(f"     Description: {resource['description']}")
        print(f"     Why Recommended: {resource['why_recommended']}")
        print(f"     Prerequisites: {resource['prerequisite_knowledge']}")
        print(f"     Access: {resource['access_info']}")
    
    print(f"\n🚀 Next Steps:\n{result3['next_steps']}\n")