# Accessibility and Responsive Design

## What was done
- Visible focus outline on every interactive element (white on the dark navbar)
- Reduced-motion support for people who turn off animations
- Text colours adjusted so small grey text meets the 4.5:1 contrast ratio
- Every form field has a visible label, and errors use `role="alert"`
- Status messages use `role="status"`
- Responsive navbar, forms and grids. Wide tables scroll inside their own box
- Loading placeholders, a styled 404 page and an error page

## Checks (run in the browser developer tools)
| Check | Result |
|-------|--------|
| Phone width (375 px): no sideways page scrolling | [fill in] |
| Keyboard only: every link and button reachable, focus visible | [fill in] |
| Zoom 200%: nothing overlaps or is cut off | [fill in] |
| Lighthouse Accessibility, home page | [fill in] |
| Lighthouse Accessibility, /vehicles | [fill in] |
| Lighthouse Accessibility, /locations | [fill in] |

## Known gaps
- Vehicle photos are placeholders, so there is no image alt text yet
- The map is not keyboard-navigable. Locations are also listed beside it as buttons
- Not yet tested with a screen reader