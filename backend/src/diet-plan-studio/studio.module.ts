import { Module, Controller, Post, Body, UseGuards, ServiceUnavailableException, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsIn } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

class ExplainPreviewDto {
  @IsIn(['pk', 'in', 'bd', 'sa', 'ae', 'ca', 'us'])
  region: string;
}
const PANTRIES: Record<string, string> = {
  pk: 'Pakistan: atta, lentils, rice, seasonal vegetables, plain yoghurt',
  in: 'India: atta, pulses, rice, curd, seasonal vegetables',
  bd: 'Bangladesh: rice, lentils, fish, eggs, seasonal vegetables',
  sa: 'Saudi Arabia: rice, lentils, wholewheat khubz, chicken, plain yoghurt',
  ae: 'United Arab Emirates: wholewheat khubz, chickpeas, rice, labneh, vegetables',
  ca: 'Canada: oats, lentils, rice, frozen vegetables, milk',
  us: 'United States: oats, beans, rice, frozen vegetables, eggs',
};

// Admin-only proof of real provider integration. No health profiles or plan generation.
@Controller('diet-plan-studio')
export class StudioController {
  constructor(private readonly config: ConfigService) {}

  @Post('explain-preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async explain(@Body() body: ExplainPreviewDto) {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (!key) throw new ServiceUnavailableException('AI preview is not enabled yet. Configure the server AI provider to activate it.');
    const model = this.config.get<string>('STUDIO_AI_MODEL', 'gemini-2.5-flash-lite');
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Write a short educational explanation (under 150 words) of how someone could organise familiar foods into breakfast, lunch and dinner. Use ONLY the following illustrative pantry: ${PANTRIES[body.region]}. Do not give calorie targets, quantities, medical advice, treatment, diagnoses or claim these foods are available in every city. Explain that this is an AI-generated example, not a personalised diet plan, and that a qualified dietitian should review actual plans. No markdown headings.` }] }],
          generationConfig: { maxOutputTokens: 350, temperature: 0.3 },
        }),
      });
    } catch { throw new BadGatewayException('The AI provider could not be reached. Please try again later.'); }
    if (!response.ok) throw new BadGatewayException('The AI provider did not accept the request. Check provider configuration and quota.');
    const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const explanation = data.candidates?.[0]?.content?.parts?.map((p: {text?: string}) => p.text || '').join('').trim();
    if (!explanation) throw new BadGatewayException('No AI explanation was returned.');
    return { explanation, model, mode: 'educational-preview', personalised: false };
  }
}

@Module({ controllers: [StudioController] })
export class StudioModule {}
