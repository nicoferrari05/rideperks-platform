export type UserRole = 'driver' | 'admin' | 'business'
export type DriverStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type DriverPlatform = 'uber' | 'indrive' | 'pedidosya' | 'multiple'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type QRTokenStatus = 'pending' | 'used' | 'expired'
export type DiscountType = 'percentage' | 'fixed' | 'free_item' | 'other'
export type PaymentMethod = 'yappy' | 'transfer' | 'cash'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  platform: DriverPlatform | null
  status: DriverStatus
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DriverVerification {
  id: string
  driver_id: string
  photo_url: string
  platform: DriverPlatform
  status: VerificationStatus
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
  driver?: Profile
}

export interface PartnerBusiness {
  id: string
  name: string
  description: string | null
  category: string | null
  address: string | null
  waze_url: string | null
  phone: string | null
  logo_url: string | null
  is_active: boolean
  access_code: string | null
  created_at: string
}

export interface Benefit {
  id: string
  business_id: string | null
  title: string
  description: string
  discount_type: DiscountType
  discount_value: string | null
  applicable_platforms: DriverPlatform[]
  terms: string | null
  is_active: boolean
  usage_limit_per_driver: number | null
  image_url: string | null
  valid_from: string | null
  valid_until: string | null
  created_at: string
  partner_businesses?: PartnerBusiness
}

export interface Subscription {
  id: string
  driver_id: string
  status: SubscriptionStatus
  plan_name: string
  amount: number | null
  currency: string
  starts_at: string
  expires_at: string
  payment_method: PaymentMethod | null
  payment_reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  profiles?: Profile
}

export interface QRToken {
  id: string
  driver_id: string
  benefit_id: string
  token: string
  status: QRTokenStatus
  expires_at: string
  used_at: string | null
  used_by_business: string | null
  created_at: string
  benefits?: Benefit
  profiles?: Profile
}

export interface BenefitRedemption {
  id: string
  driver_id: string
  benefit_id: string
  business_id: string | null
  qr_token_id: string | null
  redeemed_at: string
  benefits?: Benefit
  profiles?: Profile
  partner_businesses?: PartnerBusiness
}
