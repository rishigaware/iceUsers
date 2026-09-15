# ImageCarousel Component

A unified carousel component for both user and admin interfaces with permission-based functionality.

## Features

- **Two Layout Types**: Horizontal and Square image carousels
- **Permission-Based Access**: Admin can upload/delete, users can only view
- **Modern UI**: Gradient buttons, hover effects, loading states
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Comprehensive error handling with toast notifications

## Usage

### User Interface (View Only)
```jsx
<ImageCarousel 
  type="horizontal" 
  carouselId="horizontal-main"
  canManage={false}
/>
```

### Admin Interface (Full Management)
```jsx
<ImageCarousel 
  type="square" 
  carouselId="square-main"
  canManage={true}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Layout type: "horizontal" or "square" |
| `carouselId` | string | Yes | Unique identifier for the carousel |
| `canManage` | boolean | No | Whether user can upload/delete images (default: false) |

## API Endpoints

- `GET /api/images/get/:carouselId` - Fetch images for a carousel
- `POST /api/images/upload` - Upload a new image
- `DELETE /api/images/delete/:imageId` - Delete an image
- `GET /api/images/stats/:carouselId` - Get carousel statistics

## File Structure

```
ImageCarousel/
├── ImageCarousel.jsx          # Main component
├── ImageCarousel.module.css   # Styles
└── README.md                  # Documentation
```

## Styling

The component uses CSS modules with responsive design:
- Horizontal carousel: 300px height (200px on mobile)
- Square carousel: 400px height (250px on mobile)
- Gradient upload buttons with hover effects
- Delete buttons appear on hover
- Loading spinner and states

