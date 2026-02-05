-- Styles Table (for AI generation prompts and categorization)
CREATE TABLE IF NOT EXISTS styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE, -- e.g., 'formal', 'hawaiian', 'streetwear'
    name TEXT NOT NULL,
    description TEXT,
    custom_prompt TEXT NOT NULL, -- The prompt used for image generation
    image_url TEXT, -- Representative image for the style
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table (Clothing, Grooming, Accessories)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'Clothing', 'Grooming', 'Accessory'
    image_url TEXT NOT NULL,
    purchase_url TEXT, -- External link to purchase
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'KRW',
    brand TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Table: Products <-> Styles
CREATE TABLE IF NOT EXISTS product_styles (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, style_id)
);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT, -- 'gallery', 'hero', etc.
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Styling Requests (Log user interactions)
CREATE TABLE IF NOT EXISTS styling_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Anonymous or Authenticated
    original_image_url TEXT,
    generated_image_url TEXT,
    selected_style_id UUID REFERENCES styles(id),
    custom_prompt_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_styles_slug ON styles(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery_images(is_active);

-- RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE styling_requests ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read access for styles" ON styles FOR SELECT USING (true);
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for product_styles" ON product_styles FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery_images" ON gallery_images FOR SELECT USING (true);

-- User Policies for Styling Requests
CREATE POLICY "Users can view their own requests" ON styling_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own requests" ON styling_requests FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_styles_updated_at BEFORE UPDATE ON styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
