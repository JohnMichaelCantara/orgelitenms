import { User, Event, Announcement, GalleryItem, Notification, UserRole } from './types';

/**
 * LOGO MAPPING:
 * 1. The Lites Press (Shield with 'n', 2004)
 * 2. NMS Elite (Black/Silver Rectangle)
 * 3. SSLG (Supreme Secondary Learner Government)
 */

// Primary NMS Elite logo for portal header
export const MAIN_LOGO = "https://lh3.googleusercontent.com/sitesv/APaQ0STzma6Cr7r5fy1y-iKLENGA5vPXdV7g9qEV5rxRXxQZMB8spMjHtqrOrDk2VCI5cXnq2_HmOHIRWs4-7EK80ewSdsn1aO5zCDQPNgQJkjxbaN2dRF62C7FkSygcO2MSKW6HXH2f5L7Ohwgm3pwFjgDa0o-YZ81b7yisVyc2C6scRfr1Pg_0uzt55lw=w1280";

// The Three Organization Logos cluster
export const LOGO_URLS = [
  "https://lh3.googleusercontent.com/sitesv/APaQ0SSEwJZQyXPHprIhSsmkGSWBGgCK-16PhE44zC4vd14gO-uJs1QZodQI9gIVBOE8b2I560F2cfFwlNzAY7l_uTWHvvdnpgCXxlPskxqy5Xw6f0CnbbgPZzTkdH-H0y9VGkBNvCTBCOft-WS65zClXgt1x-gQIhEAkQKV_CPfvNns9XQND3rY8Oso42SabQAus1YmL7cXqJBSr3zEHgyKvRhQR7cNpoQ_PO8ybR8=w1280", // The Lites Press
  "https://lh3.googleusercontent.com/sitesv/APaQ0SRoI04sEAPRbpHVzVz0I6W-5nDRFzRklHegz7DmYaed_PlCgFm4jqu6bZvHBfkXGHJi1Tnn9C1AMvwKatJ_AjqbPq8JZ2JBON0N6GG-DmTbnFH3v_eyFjSvdfdUBda5o2tLmp2jd4OV0iqoYWzz_hHo_QpeLkTyKn3kmfvSS3RFYZFI_T1EarI3J60vpohODh1_PFt7v6_vmHvRrqNURwv2KICm0S0TEkxKkEY=w1280", // NMS Elite
  "https://lh3.googleusercontent.com/sitesv/APaQ0SSSZPcrDc9aedxyJObNzIOoSyNKoSV9T5sRMI8cVD9DwwNWfVe_ijDKg3W35zU948vfEIZATxE7ioNhrxOaV1rrqem2T9I2OfuXRPUo0cQrxibaBmYhbx4ZJmYFCfq_LtdRNzORQRcN6G8pK7D3aQw95HtJnGEit_q6nE5NZwl8TpfWbDQYKg1mQ1cg-Y8IRvW6XgUR_0VZgd5P0ELzc7rd2TcPq6BPnk-86VM=w1280"  // SSLG
];

export const DASHBOARD_BG = "https://lh3.googleusercontent.com/sitesv/APaQ0SSm_lEo4r53lOo2iQOjlJlQ8A1Rod1uGZ6OfnkLxhuwYnghFGcbVutSOLoi9VDU1Gi0Bu3PUcosnJNw1kMQDgByX3He_Dj41AldfW3jIoXi9RBlDMRt1rflaIrct337pmcuaqZKIQqQ_fda5uPC0TD-JwXi2DidFcubgZ_f9f9NvdpWgdRZsrFh_w2RYUl9-JpETmp0IfuyeIokBQXgqQKe9MnUlSPo8DFf=w1280";

export const MOCK_USERS: User[] = [];
export const INITIAL_EVENTS: Event[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
