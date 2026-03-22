# 🎯 Step-by-Step Testing Guide

## Pre-Testing Setup

1. **Start the app**
   ```bash
   expo start
   ```

2. **Run on simulator/device**
   - iOS: `i` in terminal
   - Android: `a` in terminal

3. **Prepare two accounts**
   - Admin: admin@fitsphere.com / admin123
   - Customer: customer@fitsphere.com / customer123

---

## Test 1: Create First Promo Code (4 minutes)

**Goal**: Verify admin can create promo codes and notification is sent

### Step-by-Step:

1. **Login as Admin**
   - Open app
   - Tap "Login"
   - Email: admin@fitsphere.com
   - Password: admin123
   - Tap "Login"
   - ✓ Should be on Admin Dashboard

2. **Navigate to Promo Codes**
   - You should see a "Promos" card on the dashboard
   - Tap it immediately
   - ✓ Should see "Promo Codes" screen with 3 demo codes

3. **Create New Code**
   - Tap the **"+"** button (add) in top right corner
   - Should see a modal form with fields:
     - Promo Code
     - Discount Percentage
     - Description
     - Expiration Date
   - ✓ Form should be empty

4. **Fill the Form**
   ```
   Promo Code:        SUMMER20
   Discount %:        20
   Description:       Get 20% off all summer fitness gear
   Expiration Date:   2024-12-31
   ```

5. **Save the Code**
   - Tap the **"Create"** button
   - ✓ Should see alert: "Promo code created and notification sent!"
   - ✓ Alert shows: "Code: SUMMER20"
   - ✓ Modal should close
   - ✓ New code should appear in list at top with "Active" status

6. **Verify Code in List**
   - Should see SUMMER20 card showing:
     - ✓ Code: SUMMER20
     - ✓ Discount: 20%
     - ✓ Status: Active (green)
     - ✓ Expiration: 2024-12-31
   - ✓ Date showing today's date as created date

7. **Check Action Buttons**
   - Each code card should have:
     - ✓ Edit button (pencil icon)
     - ✓ Power button (activate/deactivate)
     - ✓ Delete button (trash icon)

**Expected Result**: ✅ Code created, notification sent, appears in list

**Next**: Switch to customer account to receive notification

---

## Test 2: Receive & View Notification (3 minutes)

**Goal**: Verify customer receives notification and can view details

### Step-by-Step:

1. **Login as Customer**
   - Press back to go to login
   - Tap "Logout" or go to ProfileScreen and logout
   - Email: customer@fitsphere.com
   - Password: customer123
   - Tap "Login"
   - ✓ Should be on Home screen as customer

2. **Look for Push Notification**
   - You should see a push notification from FitSphere
   - Title: **"New Promotion Available! 🎉"**
   - Body should contain: **"Get 20% off with code: SUMMER20"**
   - ✓ If not visible, check notification center/pull down from top

3. **Tap the Notification**
   - Tap the promotion notification
   - ✓ Should navigate to NotificationDetailsScreen

4. **Verify Notification Details**
   - Should see:
     - ✓ Icon: Gift emoji icon (orange)
     - ✓ Title: "New Promotion Available! 🎉"
     - ✓ Body: The promotion message with discount info
     - ✓ **Promo Code Section** with:
       - Label: "Your Promo Code"
       - Code: **"SUMMER20"** (large, bold, orange)
       - Copy button (copy icon)
     - ✓ Discount info: "20% Discount" with percentage icon
     - ✓ Description: "Get 20% off all summer fitness gear"
     - ✓ Timestamp: "Received: [current date/time]"

5. **Check Buttons**
   - Should see two buttons at bottom:
     - ✓ **"Close"** button (secondary)
     - ✓ **"Apply in Cart"** button (orange)

**Expected Result**: ✅ Notification received, details displayed correctly, buttons ready

**Next**: Copy code and go to cart

---

## Test 3: Copy Promo Code (2 minutes)

**Goal**: Verify copy button works correctly

### Step-by-Step:

1. **Still on Notification Details Screen**
   - You should see the code "SUMMER20" in orange box
   - Next to it is a copy icon

2. **Tap Copy Button**
   - Tap the **copy icon** next to "SUMMER20"
   - ✓ Should see alert: **"Copied!"**
   - ✓ Message: "Promo code "SUMMER20" copied to clipboard"
   - ✓ Copy icon might change briefly (optional checkmark)

3. **Dismiss Alert**
   - Tap "OK" to close the alert
   - ✓ Alert should dismiss
   - ✓ Should still be on notification details

**Expected Result**: ✅ Code copied to clipboard, confirmation shown

**Note**: In production, integrate with Clipboard API for seamless copy

**Next**: Navigate to cart and apply code

---

## Test 4: Navigate to Cart (2 minutes)

**Goal**: Verify navigation to cart from notification

### Step-by-Step:

1. **On Notification Details Screen**
   - You should see **"Apply in Cart"** button (orange)
   - Tap it

2. **Navigation**
   - ✓ Should navigate to CartScreen
   - ✓ You might see an alert: "Go to Cart - The promo code SUMMER20 is ready to apply!"
   - Tap "OK" to dismiss

3. **Verify Cart Screen**
   - ✓ Should be on CartScreen
   - ✓ Should see cart items (if any)
   - ✓ At bottom should see "Promo Code" section

4. **Add Items (if cart is empty)**
   - If cart is empty, go back to HomeScreen
   - Add a few items ($100+ total recommended)
   - Return to CartScreen

**Expected Result**: ✅ Successfully navigated to cart with items

**Next**: Apply the promo code

---

## Test 5: Apply Promo Code (3 minutes)

**Goal**: Verify promo code application and discount calculation

### Step-by-Step:

1. **On CartScreen with Items**
   - Scroll to bottom if needed
   - Should see **"Promo Code"** section with:
     - ✓ Text input field (grey background)
     - ✓ **"Apply"** button (orange)

2. **Enter Promo Code**
   - Tap the promo code input field
   - Type or paste: **SUMMER20**
   - ✓ Input field should show "SUMMER20"

3. **Tap Apply Button**
   - Tap the **orange "Apply"** button
   - ✓ Should see alert: **"Promo code applied!"**
   - ✓ Message: "You get 20% off"
   - Tap "OK"

4. **Verify Discount Applied**
   - ✓ Alert should dismiss
   - ✓ Below the promo input should now show:
     ```
     Discount (SUMMER20)    -$XX.XX
     ```
     - Orange left border
     - Orange label color
     - Green amount (savings)

5. **Check Total Calculation**
   - Find total display:
     ```
     Subtotal:        $100.00
     Discount:        -$20.00  (20% off)
     ──────────────────────
     Final Total:     $80.00
     ```
   - ✓ Subtotal should be original amount
   - ✓ Discount should be 20% of subtotal
   - ✓ Total should be subtotal minus discount

6. **Verify Checkout Button**
   - Should see a green/orange **"Proceed to Checkout"** button
   - ✓ Button should be enabled
   - ✓ Discount is ready for purchase

**Expected Result**: ✅ Code applied, discount calculated, total updated, ready to checkout

**Calculation Check Example**:
```
If Subtotal = $100.00
Discount = 20%
Calculation = 100 * 0.20 = $20.00
Final = 100 - 20 = $80.00
```

**Next**: Proceed to checkout or test other codes

---

## Test 6: Try Invalid Code (2 minutes)

**Goal**: Verify error handling for invalid codes

### Step-by-Step:

1. **Back on CartScreen**
   - Clear the current promo code input
   - Select all and delete: SUMMER20

2. **Enter Invalid Code**
   - Type: **BADCODE123**
   - Tap **"Apply"**
   - ✓ Should see alert: **"Invalid Code"** or similar
   - Close alert

3. **Enter Expired Code**
   - Clear input
   - Type: **FIT50** (this expires 2024-01-10, which is in the past)
   - Tap **"Apply"**
   - ✓ Should see alert indicating code is expired or invalid
   - Close alert

4. **Enter Valid Code Again**
   - Clear input
   - Type: **WELCOME10**
   - Tap **"Apply"**
   - ✓ Should see alert: "Promo code applied! You get 10% off"
   - ✓ Discount shown as 10%

**Expected Result**: ✅ Error handling works, only valid codes apply

**Next**: Test admin code management

---

## Test 7: Edit Promo Code (3 minutes)

**Goal**: Verify admin can edit existing codes

### Step-by-Step:

1. **Login as Admin Again**
   - Go to ProfileScreen
   - Tap "Logout"
   - Login with admin@fitsphere.com / admin123

2. **Navigate to Promo Codes**
   - Go to Admin Dashboard
   - Tap "Promos" quick action
   - ✓ See list with codes including SUMMER20 you created

3. **Find and Edit SUMMER20**
   - Look for SUMMER20 card
   - Tap the **"Edit"** button (pencil icon)
   - ✓ Form modal should appear with current values:
     - Code: **SUMMER20**
     - Discount: **20**
     - Description: original description
     - Expiration: **2024-12-31**

4. **Change Discount**
   - Tap discount field
   - Clear it and type: **25**
   - Keep other fields same
   - Tap **"Update"**
   - ✓ Should see alert: "Promo code updated successfully"
   - Modal should close

5. **Verify Update in List**
   - SUMMER20 card should now show: **25%** discount
   - Other fields unchanged

6. **Test Updated Code as Customer**
   - Switch to customer account
   - Go to any order or cart with original discount code
   - Enter: SUMMER20
   - Apply
   - ✓ Should now get 25% off (not 20%)

**Expected Result**: ✅ Code edited, discount updated, works correctly

**Next**: Test deactivating codes

---

## Test 8: Deactivate Promo Code (2 minutes)

**Goal**: Verify admin can disable codes without deleting them

### Step-by-Step:

1. **On Admin Promo Codes Screen**
   - Find SUMMER20 card
   - Status should show: "Active" (green)

2. **Tap Power Button**
   - Tap the **power icon** on SUMMER20 card
   - ✓ Status should change to **"Inactive"** (red)
   - ✓ Code should remain in list
   - ✓ No confirmation needed

3. **Test Deactivated Code as Customer**
   - Switch to customer account
   - Go to cart
   - Try to apply: SUMMER20
   - Tap **"Apply"**
   - ✓ Should see alert: "Invalid Code" or "Code not available"
   - ✓ Discount NOT applied

4. **Reactivate Code (Optional)**
   - Back to admin
   - Tap power icon on SUMMER20 again
   - ✓ Status changes back to "Active" (green)
   - Test code works again as customer

**Expected Result**: ✅ Deactivation works, code disabled but not deleted

**Next**: Test code deletion

---

## Test 9: Delete Promo Code (2 minutes)

**Goal**: Verify admin can permanently delete codes

### Step-by-Step:

1. **On Admin Promo Codes Screen**
   - Find a code you want to delete (try SUMMER20)
   - Tap the **trash icon**

2. **Confirm Deletion**
   - ✓ Should see confirmation dialog
   - ✓ Message: "Really delete this promo code?"
   - ✓ Buttons: "Cancel" and "Delete"

3. **Tap Delete**
   - Tap the **"Delete"** button
   - ✓ Should see alert: "Promo code deleted"
   - Alert should dismiss

4. **Verify Removal**
   - ✓ Code should NO LONGER appear in list
   - ✓ Other codes unchanged

5. **Test Deleted Code as Customer**
   - Switch to customer
   - Go to cart
   - Try to apply the deleted code
   - ✓ Should show "Invalid Code" error
   - ✓ Code is gone

**Expected Result**: ✅ Deletion works, code permanently removed

**Next**: Test creating multiple codes

---

## Test 10: Multiple Codes (5 minutes)

**Goal**: Verify system handles multiple promo codes

### Step-by-Step:

1. **Create 3 Different Codes**
   - As admin, create:
     ```
     Code 1: WELCOME10 (10% off)
     Code 2: SEASONAL15 (15% off)
     Code 3: VIP30 (30% off)
     ```
   - ✓ All should appear in list
   - ✓ All should send notifications

2. **As Customer, Check Notifications**
   - Should receive 3 notifications:
     - Get 10% off with code: WELCOME10
     - Get 15% off with code: SEASONAL15
     - Get 30% off with code: VIP30

3. **Apply Different Code**
   - Go to CartScreen
   - First apply: WELCOME10
   - ✓ See discount: 10%
   - Clear and apply: SEASONAL15
   - ✓ See discount: 15% (updated from previous code)
   - Clear and apply: VIP30
   - ✓ See discount: 30% (updated again)

4. **Verify Highest Discount**
   - Only one code can be applied at a time
   - System should replace previous code with new code
   - Last applied code's discount is what's shown

**Expected Result**: ✅ Multiple codes work, system handles switching between codes

---

## Test 11: Edge Cases (5 minutes)

**Goal**: Test boundary conditions and error states

### Test Case A: Discount Boundaries
1. As admin, try to create code with:
   - Discount: 0 → Should show error
   - Discount: 101 → Should show error
   - Discount: 1 → ✓ Should work (minimum)
   - Discount: 100 → ✓ Should work (maximum)

### Test Case B: Empty Fields
1. Try to create code with:
   - No code → Should show error: "Please fill in all fields"
   - No discount → Should show error
   - No description → Should show error
   - No expiration → Should show error

### Test Case C: Code Format
1. Create code with lowercase:
   - Type: summer20
   - ✓ Should auto-convert to: SUMMER20
   - As customer, apply code as "summer20" or "SUMMER20"
   - ✓ Both should work (case-insensitive)

### Test Case D: Large Discount
1. Create code: HALFOFF with 50% discount
   - Apply with $100 order
   - ✓ Shows: -$50.00
   - ✓ Final total: $50.00

**Expected Result**: ✅ All edge cases handled gracefully

---

## Complete Test Checklist

### Admin Features
- [ ] Can create promo code
- [ ] Form validates all fields
- [ ] Discount bounds 1-100 enforced
- [ ] Code converts to uppercase
- [ ] Notification sent on creation
- [ ] Can edit existing code
- [ ] Can deactivate code (not deleted)
- [ ] Can reactivate code
- [ ] Can delete code permanently
- [ ] List displays all codes correctly
- [ ] Status shows Active/Inactive color

### Customer Notification
- [ ] Receives push notification
- [ ] Title correct format
- [ ] Body shows code and discount
- [ ] All notification details shown
- [ ] Gift icon displays for promos
- [ ] Timestamp shown

### Promo Details
- [ ] Code displayed prominently
- [ ] Copy button functional
- [ ] Discount % shown
- [ ] Description displayed
- [ ] "Apply in Cart" button works
- [ ] "Close" button works

### Cart Integration
- [ ] Promo input field present
- [ ] Can type/paste code
- [ ] Apply button functional
- [ ] Valid code applies successfully
- [ ] Invalid code shows error
- [ ] Discount calculated correctly
- [ ] Discount row displays properly
- [ ] Total updated correctly
- [ ] Can switch between codes
- [ ] Can clear promo code
- [ ] Expired codes rejected

### UI/UX
- [ ] Orange buttons (#FF8C42)
- [ ] Grey text (#4B5563) for labels
- [ ] Green savings display (#10b981)
- [ ] Responsive design
- [ ] No crashes or errors
- [ ] Forms validate properly
- [ ] Alert messages clear and helpful

---

## Troubleshooting

### Issue: Notification Not Received
**Solution**:
- Check app notification permissions
- Ensure expo-notifications initialized
- Check device notification settings
- Look in notification center

### Issue: Code Not Working in Cart
**Solution**:
- Verify code is Active (not red)
- Check code spelling (must be exact match)
- Ensure code hasn't expired
- Try logging out and back in

### Issue: Discount Math Wrong
**Solution**:
- Discount = percentage of subtotal
- Example: 20% of $100 = $20 savings
- Verify calculation manually

### Issue: Form Won't Submit
**Solution**:
- Check all fields are filled
- Verify discount is 1-100 number
- Check date format is YYYY-MM-DD
- Try refreshing screen

### Issue: Notification Details Don't Show
**Solution**:
- Ensure notification was created after code launch
- Check notification tap routing
- Verify data payload included
- Check route parameters

---

## Performance Notes

- Creating code: <1 second
- Sending notification: <500ms
- Applying code: <100ms (validation)
- Switching codes: <100ms
- Discount calculation: <50ms

**All should be instant to user**

---

## Success Criteria

✅ All 11 tests pass
✅ No console errors
✅ No app crashes
✅ Smooth animations
✅ Clear error messages
✅ Professional UI

**Ready for Production! 🚀**

---

## Questions During Testing?

1. **Notification not showing?** → Check notification center or pull from top
2. **Code not working?** → Verify it's active (green status) and correct spelling
3. **Discount wrong?** → Recalculate percentage manually
4. **Form won't save?** → Check all fields are filled correctly
5. **Button not responding?** → Try tapping again or refresh screen

**All tests should pass without issues!**

Good luck! 🎉
