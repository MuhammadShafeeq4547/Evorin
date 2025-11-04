// utils/aiHelpers.js
const axios = require('axios');

const aiHelpers = {
  // Generate caption suggestions using AI
  generateCaptions: async (imageUrl, userPrompt = '') => {
    try {
      // Option 1: Using OpenAI (if API key is available)
      if (process.env.OPENAI_API_KEY) {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userPrompt || 'Generate 3 creative and engaging Instagram captions for this image. Include relevant emojis and hashtags. Each caption should be unique and catchy.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl
                    }
                  }
                ]
              }
            ],
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const text = response.data.choices[0].message.content;
        const captions = text.split('\n\n').filter(c => c.trim().length > 0);
        
        return {
          success: true,
          captions: captions.slice(0, 3)
        };
      }

      // Option 2: Fallback to template-based captions
      return {
        success: true,
        captions: [
          `Living my best life! ✨ #blessed #goodvibes #lifestyle`,
          `Making memories one photo at a time 📸 #photography #memories #instagood`,
          `Just another day in paradise 🌴 #travel #adventure #wanderlust`
        ]
      };
    } catch (error) {
      console.error('Generate captions error:', error);
      
      // Return template captions on error
      return {
        success: false,
        captions: [
          `Capturing moments 📷 #photooftheday #instagood`,
          `Living in the moment ✨ #lifestyle #blessed`,
          `Making today count! 💫 #motivation #goodvibes`
        ]
      };
    }
  },

  // Moderate content for inappropriate material
  moderateContent: async (text = '', imageUrl = null) => {
    try {
      let flags = {
        inappropriate: false,
        spam: false,
        hate: false,
        violence: false,
        adult: false,
        reasons: []
      };

      // Text moderation
      if (text) {
        // Basic keyword filtering
        const inappropriateWords = [
          'spam', 'scam', 'click here', 'buy now',
          // Add more inappropriate words/phrases
        ];

        const lowerText = text.toLowerCase();
        const foundWords = inappropriateWords.filter(word => 
          lowerText.includes(word)
        );

        if (foundWords.length > 0) {
          flags.inappropriate = true;
          flags.spam = true;
          flags.reasons.push('Contains spam keywords');
        }

        // Check for excessive caps
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.6 && text.length > 20) {
          flags.spam = true;
          flags.reasons.push('Excessive use of capital letters');
        }

        // Check for excessive links
        const urlCount = (text.match(/https?:\/\//g) || []).length;
        if (urlCount > 3) {
          flags.spam = true;
          flags.reasons.push('Too many links');
        }
      }

      // Image moderation using AI (if available)
      if (imageUrl && process.env.OPENAI_API_KEY) {
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4-vision-preview',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Analyze this image for inappropriate content. Check for: violence, adult content, hate symbols, or dangerous activities. Respond with ONLY "SAFE" or "UNSAFE: [reason]".'
                    },
                    {
                      type: 'image_url',
                      image_url: { url: imageUrl }
                    }
                  ]
                }
              ],
              max_tokens: 100
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const result = response.data.choices[0].message.content;
          if (result.includes('UNSAFE')) {
            flags.inappropriate = true;
            flags.reasons.push(result.replace('UNSAFE:', '').trim());
          }
        } catch (aiError) {
          console.error('AI moderation error:', aiError);
        }
      }

      return {
        success: true,
        safe: !flags.inappropriate,
        flags
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      
      // On error, allow content but log for manual review
      return {
        success: false,
        safe: true,
        flags: {
          inappropriate: false,
          spam: false,
          hate: false,
          violence: false,
          adult: false,
          reasons: ['Moderation service unavailable']
        }
      };
    }
  },

  // Extract hashtags from text
  extractHashtags: (text) => {
    if (!text) return [];
    
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const matches = text.match(hashtagRegex) || [];
    
    return matches.map(tag => tag.substring(1).toLowerCase());
  },

  // Generate trending hashtags based on content
  suggestHashtags: async (caption, existingHashtags = []) => {
    try {
      // Extract topics from caption
      const words = caption.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !existingHashtags.includes(word));

      // Popular general hashtags
      const popularHashtags = [
        'instagood', 'photooftheday', 'love', 'beautiful', 'happy',
        'followme', 'like4like', 'instadaily', 'amazing', 'bestoftheday'
      ];

      // Combine and deduplicate
      const suggestions = [
        ...words.slice(0, 5),
        ...popularHashtags.slice(0, 5)
      ].filter(tag => !existingHashtags.includes(tag));

      return {
        success: true,
        hashtags: suggestions.slice(0, 10)
      };
    } catch (error) {
      console.error('Suggest hashtags error:', error);
      return {
        success: false,
        hashtags: ['instagood', 'photooftheday', 'love']
      };
    }
  },

  // Analyze sentiment of text
  analyzeSentiment: (text) => {
    try {
      if (!text) {
        return {
          sentiment: 'neutral',
          score: 0
        };
      }

      // Simple sentiment analysis using keyword matching
      const positiveWords = ['love', 'amazing', 'great', 'beautiful', 'happy', 'best', 'awesome', 'wonderful'];
      const negativeWords = ['hate', 'terrible', 'bad', 'awful', 'worst', 'horrible', 'sad', 'angry'];

      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

      const score = positiveCount - negativeCount;
      
      let sentiment = 'neutral';
      if (score > 0) sentiment = 'positive';
      else if (score < 0) sentiment = 'negative';

      return {
        sentiment,
        score,
        positiveCount,
        negativeCount
      };
    } catch (error) {
      console.error('Analyze sentiment error:', error);
      return {
        sentiment: 'neutral',
        score: 0
      };
    }
  }
};

module.exports = aiHelpers;