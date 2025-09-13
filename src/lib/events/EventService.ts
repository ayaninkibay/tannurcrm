// services/EventService.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { Event, CreateEventInput, UpdateEventInput } from '@/types/custom.types';

export class EventService {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  // ========================================
  // ПОЛУЧЕНИЕ СОБЫТИЙ
  // ========================================

  /**
   * Получить все события с вычисленными статусами
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_all_events');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Получить событие по ID
   */
  async getEventById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Получить опубликованные события
   */
  async getPublishedEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('priority', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching published events:', error);
      throw error;
    }
  }

  /**
   * Получить события для админа (все статусы)
   */
  async getAdminEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin events:', error);
      throw error;
    }
  }

  /**
   * Получить активные события (текущие)
   */
  async getActiveEvents(): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active events:', error);
      throw error;
    }
  }

  /**
   * Получить предстоящие события
   */
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gt('start_date', today)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Получить прошедшие события
   */
  async getPastEvents(limit: number = 10): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .lt('end_date', today)
        .order('end_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }
  }

  // ========================================
  // СОЗДАНИЕ И ОБНОВЛЕНИЕ
  // ========================================

  /**
   * Создать новое событие
   */
  async createEvent(input: CreateEventInput): Promise<Event> {
    try {
      const { data: userData } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('events')
        .insert([{
          ...input,
          created_by: userData?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Обновить событие
   */
  async updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Удалить событие
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // ========================================
  // УПРАВЛЕНИЕ СТАТУСОМ
  // ========================================

  /**
   * Опубликовать событие
   */
  async publishEvent(id: string): Promise<Event> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  }

  /**
   * Снять с публикации (в черновик)
   */
  async unpublishEvent(id: string): Promise<Event> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .update({ 
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error unpublishing event:', error);
      throw error;
    }
  }

  /**
   * Архивировать событие
   */
  async archiveEvent(id: string): Promise<Event> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error archiving event:', error);
      throw error;
    }
  }

  // ========================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ========================================

  /**
   * Дублировать событие
   */
  async duplicateEvent(id: string): Promise<Event> {
    try {
      // Получаем оригинальное событие
      const original = await this.getEventById(id);
      if (!original) throw new Error('Event not found');

      // Создаем копию с новым названием
      const duplicate: CreateEventInput = {
        title: `${original.title} (копия)`,
        short_description: original.short_description,
        description: original.description,
        start_date: original.start_date,
        end_date: original.end_date,
        goals: original.goals,
        rewards: original.rewards,
        conditions: original.conditions,
        badge_color: original.badge_color,
        badge_icon: original.badge_icon,
        priority: original.priority,
        is_featured: false,
        tags: original.tags,
        status: 'draft', // Всегда создаем как черновик
        image_url: original.image_url,
        banner_url: original.banner_url,
        gallery: original.gallery
      };

      return await this.createEvent(duplicate);
    } catch (error) {
      console.error('Error duplicating event:', error);
      throw error;
    }
  }

  /**
   * Получить статистику событий
   */
  async getEventsStats(): Promise<{
    total: number;
    active: number;
    upcoming: number;
    past: number;
    draft: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Получаем все события
      const { data: allEvents, error } = await this.supabase
        .from('events')
        .select('id, status, start_date, end_date');

      if (error) throw error;

      const events = allEvents || [];

      return {
        total: events.length,
        active: events.filter(e => 
          e.status === 'published' && 
          e.start_date <= today && 
          e.end_date >= today
        ).length,
        upcoming: events.filter(e => 
          e.status === 'published' && 
          e.start_date > today
        ).length,
        past: events.filter(e => 
          e.status === 'published' && 
          e.end_date < today
        ).length,
        draft: events.filter(e => e.status === 'draft').length
      };
    } catch (error) {
      console.error('Error fetching events stats:', error);
      throw error;
    }
  }

  /**
   * Поиск событий
   */
  async searchEvents(query: string): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  /**
   * Получить события по тегу
   */
  async getEventsByTag(tag: string): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .contains('tags', [tag])
        .eq('status', 'published')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by tag:', error);
      throw error;
    }
  }

  /**
   * Обновить приоритет событий (для сортировки)
   */
  async updateEventsPriority(updates: { id: string; priority: number }[]): Promise<void> {
    try {
      const promises = updates.map(({ id, priority }) =>
        this.supabase
          .from('events')
          .update({ priority })
          .eq('id', id)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error updating events priority:', error);
      throw error;
    }
  }
}

// Экспортируем singleton
export const eventService = new EventService();