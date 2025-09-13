// app/api/dealer/turnover/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { DealerTurnoverService } from '@/services/dealer_turnover_service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем тип данных из query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'personal'; // personal | team | bonuses | dashboard
    const userId = searchParams.get('userId') || user.id;

    // Проверяем роль (только dealer или admin могут смотреть)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'dealer' && profile.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let result;
    
    switch (type) {
      case 'personal':
        result = await DealerTurnoverService.getPersonalTurnover(userId, true);
        break;
      
      case 'team':
        result = await DealerTurnoverService.getTeamTurnover(userId, true);
        break;
      
      case 'bonuses':
        result = await DealerTurnoverService.getBonusStats(userId, true);
        break;
      
      case 'dashboard':
        result = await DealerTurnoverService.getDashboardStats(userId, true);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}