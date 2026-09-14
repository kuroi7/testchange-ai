# Sample requirement change

Previously, users could not combine a coupon and loyalty points in the same checkout.

New behavior:
- A valid coupon and loyalty points may now be used together.
- The coupon discount is applied first.
- Loyalty points are then applied to the discounted subtotal.
- Existing validation for expired/invalid coupons remains unchanged.

Use this change together with `examples/sample-test-cases.csv` for a production smoke test.
