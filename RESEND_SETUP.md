# Resend Email Setup Guide

This guide explains how to set up Resend for email notifications in Rigify.

## 📧 What Emails Are Sent

**Booking Confirmation** (customer + business)
- Service details, date/time, location
- Add to calendar links
- Confirmation ID

**Cancellation Notice** (customer + business)
- Cancelled booking details
- Booking date/time
- Who cancelled (customer/business)

**Reschedule Notice** (customer + business)
- Old vs new date/time comparison
- Service and staff details
- Booking management links

---

## 🚀 Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 2. Add Domain

**Option A: Use Your Domain (rigify.ge)**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter `rigify.ge`
4. Add DNS records to your domain registrar:
   - **SPF**: TXT record
   - **DKIM**: TXT record
   - **Return-Path**: CNAME record
5. Wait for verification (usually 5-10 minutes)

**Option B: Use Resend's Test Domain (For Development)**
1. Resend provides `onboarding.resend.dev` for testing
2. Can only send to verified email addresses
3. Good for local development

### 3. Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: `Rigify Production` or `Rigify Development`
4. Select permissions: **Sending access**
5. Copy the API key (starts with `re_`)

### 4. Add to Environment Variables

Edit `.env.local`:

```bash
# Resend — for transactional emails
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Restart your dev server after adding the key!

```bash
npm run dev
```

### 5. Update Sender Email (Optional)

If using your own domain, update the sender in `lib/emails/resend.ts`:

```typescript
// Change from
export const FROM_EMAIL = 'Rigify <noreply@rigify.ge>';

// To your verified domain
export const FROM_EMAIL = 'Rigify <noreply@yourdomain.com>';
```

---

## 🧪 Testing

### Test Booking Confirmation

1. Create a booking via `/businesses/{slug}/book`
2. Use a real email address
3. Check email inbox for confirmation

### Test Cancellation

1. Go to `/customer/dashboard`
2. Cancel a booking
3. Check inbox for cancellation notice

### Test Reschedule

1. Go to `/customer/dashboard`
2. Click "Reschedule" on a booking
3. Pick a new date/time
4. Check inbox for reschedule notice

### Check Resend Dashboard

1. Go to **Logs** in Resend dashboard
2. See all sent emails
3. Check delivery status
4. View email content

---

## 🐛 Troubleshooting

### "RESEND_API_KEY is not defined"
- Check `.env.local` has the key
- Restart dev server (`npm run dev`)
- Verify no typos in variable name

### Emails Not Sending
- Check Resend dashboard **Logs** for errors
- Verify API key has **Sending access** permission
- Check if domain is verified (if using custom domain)
- Look for error logs in terminal (`[Email]` prefix)

### Domain Not Verified
- DNS records can take up to 48 hours to propagate
- Use `dig` or `nslookup` to verify DNS records
- Use test domain `onboarding.resend.dev` while waiting

### Email Goes to Spam
- Verify SPF, DKIM, DMARC records are correct
- Use a custom domain (not test domain)
- Warm up domain by sending gradually increasing volume
- Add unsubscribe link (Resend auto-adds this)

---

## 💰 Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small usage

**Paid Plans:**
- Start at $20/month for 50,000 emails
- Pay-as-you-go available

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/emails)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [API Reference](https://resend.com/docs/api-reference/emails/send-email)

---

## 🔒 Security Notes

- **Never commit API keys** to git
- `.env.local` is already in `.gitignore`
- Rotate keys if accidentally exposed
- Use different keys for dev/staging/production
- Email sending is non-blocking (booking doesn't fail if email fails)

---

## 🎨 Email Templates

Templates are in `lib/emails/templates/`:
- `booking-confirmation-customer.ts` - Customer confirmation
- `booking-confirmation-business.ts` - Business notification
- `booking-cancellation.ts` - Cancellation notice
- `booking-reschedule.ts` - Reschedule notice

All templates:
- Match Rigify branding (gold accents, dark theme)
- Mobile-responsive
- Include relevant CTAs
- Auto-include unsubscribe footer

To customize, edit the HTML in these files.
