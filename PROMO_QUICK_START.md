# 🚀 Promo System Quick Start

## What's New?

Your FitSphere app now has a **complete promotion and discount management system** with push notifications!

## Admin: Create Promotions in 30 Seconds

1. **Login as Admin**
   - Email: admin@fitsphere.com
   - Password: admin123

2. **Go to Promos**
   - Admin Dashboard → Tap "Promos" card
   - OR Admin menu → Promo Codes

3. **Create Code**
   - Tap **"+"** button
   - Enter code: `SUMMER20`
   - Set discount: `20`
   - Description: `20% off summer sale`
   - Tap **"Create"**
   - ✅ Notification sent automatically!

---

## Customer: Get and Apply Promotions

1. **Receive Notification**
   - Wait for push notification
   - Shows: "Get 20% off with code: SUMMER20"

2. **View Details**
   - Tap notification
   - See promo code and discount

3. **Copy Code**
   - Tap copy button
   - Code in clipboard

4. **Go to Cart**
   - Tap "Apply in Cart" button
   - OR navigate to Cart manually

5. **Apply Code**
   - Paste code: SUMMER20
   - Tap "Apply"
   - See discount calculated! ✅

---

## Admin Controls

| Action | How |
|--------|-----|
| **Create** | Tap "+" button, fill form, tap "Create" |
| **Edit** | Tap "Edit", change values, tap "Update" |
| **Activate** | Tap power icon (changes to green) |
| **Deactivate** | Tap power icon (changes to red) |
| **Delete** | Tap trash icon, confirm |

---

## Example Promo Codes to Try

```
Code              Discount   Best For
─────────────────────────────────────
WELCOME10         10% off    New customers
SUMMER20          20% off    Summer sale
SAVE50            $50 off    Bundle deals
FIT50             $50 off    Fitness gear
```

---

## Test Flow (2 Minutes)

### 1️⃣ Admin Creates Code (1 min)
- Go to Admin → Promo Codes
- Tap "+"
- Enter: `TESTCODE` | Discount: `15` | Description: `Test discount`
- Tap "Create"
- ✅ See success alert

### 2️⃣ Customer Gets Notification (30 sec)
- Switch to customer account
- Look for notification: "New Promotion Available!"
- Notification shows: "Get 15% off with code: TESTCODE"

### 3️⃣ Customer Applies Code (30 sec)
- Go to Cart with items ($100+)
- Enter code: `TESTCODE`
- Tap "Apply"
- See discount: -$15.00
- Final total reduced ✅

---

## Features

### 🎯 Admin Dashboard
- ✅ Create unlimited promo codes
- ✅ Set any discount percentage
- ✅ Set expiration dates
- ✅ Edit active codes
- ✅ Activate/Deactivate codes
- ✅ Delete codes
- ✅ Automatic notification sending

### 📱 Customer App
- ✅ Receive promo notifications
- ✅ View promo details in notification
- ✅ Copy code to clipboard
- ✅ Apply code in cart
- ✅ See discount calculated
- ✅ Updated total shown

### 🔒 Validation
- ✅ Only active codes work
- ✅ Code format validation
- ✅ Discount percentage validation
- ✅ Real-time code checking

---

## Pro Tips

1. **Create Multiple Codes**
   - SEASONAL codes (SUMMER20, WINTER15)
   - VIP codes (VIP30 for loyal customers)
   - Campaign codes (BLACK50 for sales)

2. **Timing**
   - Create codes before announcement
   - Set expiration strategically
   - Use notifications to boost sales

3. **Marketing**
   - Use catchy codes (easier to remember)
   - High discounts for seasonal sales
   - Low discounts for loyalty rewards

4. **Testing**
   - Create test code with admin account
   - Switch to customer account
   - Check notification received
   - Apply code in cart
   - Verify discount

---

## Troubleshooting

**No notification received?**
- Check notification permissions in phone settings
- Ensure NotificationService is initialized
- Check expo-notifications is properly linked

**Code not working in cart?**
- Verify code is active (not red/inactive)
- Check code format (must be uppercase)
- Ensure code hasn't expired

**Discount not calculating?**
- Make sure discount is 1-100 number
- Verify code is in cart item amount range
- Check cart total is correct before applying

---

## Architecture

```
Admin Creates Code
       ↓
Notification Service
       ↓
All Customers Receive Notification
       ↓
Customer Taps Notification
       ↓
View Promotion Details
       ↓
Copy Code or Go to Cart
       ↓
Apply Code in Cart
       ↓
Discount Calculated & Applied
       ↓
Checkout with Discount ✅
```

---

## Production Ready ✅

- [ ] Test creating multiple codes
- [ ] Test with different discount percentages
- [ ] Test deactivating codes
- [ ] Test notification delivery
- [ ] Test code application in cart
- [ ] Test checkout with discount

**All tested? You're ready to launch! 🚀**

---

## Questions?

Check `PROMO_SYSTEM_DEMO.md` for detailed documentation and test scenarios.

Happy promoting! 🎉
