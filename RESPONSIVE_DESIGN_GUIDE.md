# ResumeIQ - Responsive Design Guide

## 📱 Device Support

This application is fully optimized for:
- **Mobile phones** (320px - 639px)
- **Tablets** (640px - 1023px)
- **Laptops** (1024px - 1279px)
- **Desktops** (1280px+)

## 🎯 Breakpoint Strategy

### Tailwind Breakpoints Used
```
sm:  640px  - Small tablets and large phones
md:  768px  - Tablets
lg:  1024px - Laptops and small desktops
xl:  1280px - Large desktops
```

### Layout Patterns

#### 1. Navigation
- **Mobile**: Hamburger menu, compact logo, small CTA
- **Tablet**: Same as mobile with larger touch targets
- **Desktop**: Full horizontal nav with all links visible

#### 2. Dashboard Layout
- **Mobile**: Single column, hidden sidebar
- **Tablet**: Single column, hidden sidebar
- **Desktop**: Sidebar (280px) + main content

#### 3. Content Grids
- **Mobile**: 1 column
- **Tablet**: 2 columns (resume cards, stats)
- **Desktop**: 2-3 columns depending on content

## 🎨 Component Responsive Patterns

### Buttons
```tsx
// Size adapts to screen
<Button size="sm" className="h-8 sm:h-9">
  <span className="hidden sm:inline">Full Text</span>
  <span className="sm:hidden">Short</span>
</Button>
```

### Cards
```tsx
// Padding and border radius adapt
<Card className="rounded-xl sm:rounded-2xl">
  <CardContent className="p-4 sm:p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Typography
```tsx
// Headings scale with screen size
<h1 className="text-3xl sm:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### Spacing
```tsx
// Consistent spacing pattern
<div className="space-y-4 sm:space-y-6">
  <div className="gap-3 sm:gap-4">
    {/* Content */}
  </div>
</div>
```

## 📐 Layout Examples

### Hero Section
```tsx
// Stacks on mobile, side-by-side on desktop
<div className="grid gap-8 lg:grid-cols-2">
  <div>{/* Text content */}</div>
  <div>{/* Visual content */}</div>
</div>
```

### Dashboard Stats
```tsx
// 1 col mobile, 2 col tablet, 3 col desktop
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>
```

### Form Layout
```tsx
// Full width on mobile, constrained on desktop
<form className="w-full max-w-md mx-auto space-y-4 sm:space-y-5">
  {/* Form fields */}
</form>
```

## 🎯 Touch Target Guidelines

All interactive elements meet WCAG 2.1 AA standards:
- **Minimum size**: 44x44px on mobile
- **Spacing**: 8px minimum between targets
- **Hover states**: Disabled on touch devices

### Implementation
```tsx
// Button with proper touch target
<Button className="h-10 sm:h-11 px-4 sm:px-5">
  {/* Minimum 44px height on mobile */}
</Button>
```

## 📱 Mobile-First Approach

### Base Styles (Mobile)
```css
/* Default styles are mobile-first */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}
```

### Progressive Enhancement
```css
/* Add complexity for larger screens */
@media (min-width: 640px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}
```

## 🔍 Testing Checklist

### Mobile (< 640px)
- [ ] Navigation menu works
- [ ] All text is readable
- [ ] Buttons are tappable
- [ ] Forms are usable
- [ ] Images scale properly
- [ ] No horizontal scroll

### Tablet (640px - 1023px)
- [ ] Layout adapts appropriately
- [ ] Touch targets are adequate
- [ ] Content is well-spaced
- [ ] Navigation is accessible

### Desktop (> 1024px)
- [ ] Sidebar is visible
- [ ] Multi-column layouts work
- [ ] Hover states function
- [ ] Content is not too wide

## 🎨 Visual Consistency

### Spacing Scale
```tsx
// Consistent spacing throughout
gap-2 sm:gap-3    // 8px → 12px
gap-3 sm:gap-4    // 12px → 16px
gap-4 sm:gap-6    // 16px → 24px
```

### Border Radius
```tsx
// Consistent rounding
rounded-xl sm:rounded-2xl  // 12px → 16px
rounded-2xl sm:rounded-3xl // 16px → 24px
```

### Font Sizes
```tsx
// Typography scale
text-xs sm:text-sm    // 12px → 14px
text-sm sm:text-base  // 14px → 16px
text-lg sm:text-xl    // 18px → 20px
text-3xl sm:text-4xl  // 30px → 36px
```

## 🚀 Performance Considerations

### Image Optimization
- Use responsive images with srcset
- Lazy load images below the fold
- Optimize for mobile bandwidth

### Layout Shifts
- Reserve space for dynamic content
- Use skeleton loaders
- Avoid layout changes on load

### Touch Optimization
- Disable hover effects on touch devices
- Use appropriate input types
- Optimize for thumb reach zones

## 📊 Responsive Utilities

### Hide/Show Elements
```tsx
// Show only on desktop
<div className="hidden lg:block">Desktop only</div>

// Show only on mobile
<div className="lg:hidden">Mobile only</div>

// Different content per breakpoint
<span className="hidden sm:inline">Desktop text</span>
<span className="sm:hidden">Mobile text</span>
```

### Conditional Layouts
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row">
  {/* Content */}
</div>

// Different grid columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* Items */}
</div>
```

## 🎯 Best Practices

1. **Always test on real devices** - Emulators don't capture everything
2. **Use relative units** - rem/em instead of px when possible
3. **Optimize images** - Use appropriate sizes for each breakpoint
4. **Consider touch** - Larger targets, no hover-only interactions
5. **Test landscape** - Tablets in landscape mode need special attention
6. **Check text overflow** - Ensure long text wraps or truncates properly
7. **Validate forms** - Mobile keyboards should match input types
8. **Test slow connections** - Mobile users often have slower networks

## 🔧 Debugging Tips

### Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different devices
4. Check responsive breakpoints

### Common Issues
- **Horizontal scroll**: Check for fixed widths or negative margins
- **Text too small**: Ensure minimum 16px font size on mobile
- **Buttons too small**: Check touch target sizes
- **Layout breaks**: Verify grid/flex properties at each breakpoint

## 📚 Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
