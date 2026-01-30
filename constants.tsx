import { User, Event, Announcement, GalleryItem, Notification, UserRole } from './types';

/**
 * LOGO MAPPING:
 * 1. The Lites Press (Shield with 'n', 2004)
 * 2. NMS Elite (Black/Silver Rectangle)
 * 3. SSLG (Supreme Secondary Learner Government)
 */

// Primary NMS Elite logo for portal header
export const MAIN_LOGO = "https://lh3.googleusercontent.com/sitesv/APaQ0SQTUh4spZJeOeErFVpbrpbiYBMlK9dvkMc3w94Nf4jw5lYl5TsaKhS9gLWvR3TxhSYSLavQonR546dvpPCHXu7D_sviK4iG0YXBQmkiui1nRW_1o1pCN6De9gqdzR9kH4bHa7JOquzUDfhcl-_7B-keAaGRpz5ltpJfwI6So_JN_rzUjpvmJAmNd1nDjrguPC6goFAinoF3-ON3gr20nv8s-RZIS0ZW8H1l5AE=w1280";

// The Three Organization Logos cluster
export const LOGO_URLS = [
  "https://lh3.googleusercontent.com/sitesv/APaQ0SR2ZElSkl0Fhs7wiVC6GnncThoAotKBdzWGvtNabv97BfZeQBK50kZ-gLk6MrmpsYtUT5lZyjuAXPMJ40tIgHBXmQXJx1HSIDXgOcy0usXH12kYltDj0V0-RcmyzEs6Of1K3pbd9Uh_ZM1xc6XpTgGU6SAPAyqoY8m9stSiuvfK-j0juyLdplICYus=w1280", // The Lites Press
  "https://lh3.googleusercontent.com/sitesv/APaQ0SQTUh4spZJeOeErFVpbrpbiYBMlK9dvkMc3w94Nf4jw5lYl5TsaKhS9gLWvR3TxhSYSLavQonR546dvpPCHXu7D_sviK4iG0YXBQmkiui1nRW_1o1pCN6De9gqdzR9kH4bHa7JOquzUDfhcl-_7B-keAaGRpz5ltpJfwI6So_JN_rzUjpvmJAmNd1nDjrguPC6goFAinoF3-ON3gr20nv8s-RZIS0ZW8H1l5AE=w1280", // NMS Elite
  "https://lh3.googleusercontent.com/sitesv/APaQ0SRNBjCXqZVaV9owPorJFp8AKcV35wSSj_t_nm19US9kx_NvSsRyYuFIvb2b-kkx7B_wdu3JkTwpod7EjyQeVnvQdkmGFdVNxhS-z-xWJ7S-hd9RlCs1AOPUdinuj_O7OloCaBipG7aS4Mwip_Cl1BCJ1UjgNUbrb6Vqxm9anJubNscHhQRt1YzI0Wrcg4TI5_7j4IjetZZGNkugz0I0SobHGCtgaFljoPcduRo=w1280"  // SSLG
];

export const DASHBOARD_BG = "https://lh3.googleusercontent.com/sitesv/APaQ0SQGRSpng51Foj2gQeNwuL3k4lHhTvxPBxVyAjESSVyw1fe-uDxMi7ARPm_Jkv7rgFcJ1Ru6b6gl-9M05yBYZ6ASeCTMk_-bjHR9aD8XJxLJyH-nZJ8FUwcaTgOpWZeN45fvBohwotK4cG52dRQnsaEDt3-VcT_M2YPIjeCeA-BVBNPiyJ0TAB-8qUSt7dJ6xgCI82mPILgTSFS0G1yFgQqKXNHnNXGmaWbU=w1280";

export const MOCK_USERS: User[] = [];
export const INITIAL_EVENTS: Event[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
