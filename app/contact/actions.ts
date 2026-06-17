'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function submitContactMessage(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  // Validation
  if (!name || !email || !subject || !message) {
    return { success: false, error: 'All fields are required' };
  }

  if (name.length > 100 || email.length > 100 || subject.length > 100) {
    return { success: false, error: 'Input too long' };
  }

  if (message.length > 2000) {
    return { success: false, error: 'Message is too long (max 2000 characters)' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Insert into database using admin client (bypasses RLS)
  const admin = createAdminClient();
  const { error } = await admin.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  });

  if (error) {
    console.error('Failed to save contact message:', error);
    return { success: false, error: 'Failed to send message. Please try again.' };
  }

  return { success: true };
}
