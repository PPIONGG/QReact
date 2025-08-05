/**
 * 🛠️ Screen Utilities - Functions ที่ใช้ได้โดยไม่ต้องเป็น React Component
 * 
 * ใช้เมื่อไหร่:
 * - ใน utility functions ที่ไม่ใช่ React component
 * - ใน class components (ที่ใช้ hooks ไม่ได้)
 * - เช็คแบบ one-time ไม่ต้อง real-time tracking
 * - ใน event handlers หรือ callback functions
 * 
 * ⚠️ หมายเหตุ: ถ้าใช้ใน React component ควรใช้ hooks แทน เพราะจะ update ตอน resize
 */

import { Breakpoint, DeviceType, ScreenInfo } from '../hooks/useWindowSize';

/**
 * 📱 ดึงข้อมูลหน้าจอทั้งหมดแบบ one-time
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการข้อมูลหน้าจอใน utility function
 * - เช็ค retina display (pixelRatio > 1)
 * - เช็ค orientation ใน event handler
 * 
 * ตัวอย่าง:
 * const screenInfo = getScreenInfo();
 * if (screenInfo.pixelRatio > 1) { // retina display
 *   loadHighResImages();
 * }
 */
export const getScreenInfo = (): ScreenInfo => {
  if (typeof window === 'undefined') {
    return {
      width: 1200,
      height: 800,
      availableWidth: 1200,
      availableHeight: 800,
      screenWidth: 1200,
      screenHeight: 800,
      pixelRatio: 1,
      orientation: 'landscape'
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    availableWidth: window.screen.availWidth,
    availableHeight: window.screen.availHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  };
};

/**
 * 📏 เช็ค breakpoint จากความกว้างที่กำหนด
 * 
 * ใช้เมื่อไหร่:
 * - เช็ค breakpoint ใน utility function
 * - คำนวณ layout ก่อนที่ component จะ render
 * - ใช้ใน server-side หรือ static generation
 * 
 * ตัวอย่าง:
 * const bp = getBreakpoint(1920); // 'xxl'
 * const columns = bp === 'xs' ? 1 : bp === 'sm' ? 2 : 4;
 * 
 * @param width - ความกว้าง (ถ้าไม่ใส่จะใช้ window.innerWidth)
 * @returns {Breakpoint} 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
 */
export const getBreakpoint = (width: number = window?.innerWidth || 1200): Breakpoint => {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  if (width < 1600) return 'xl';
  return 'xxl';
};

/**
 * 📱 เช็คว่าเป็น mobile หรือไม่
 * 
 * ใช้เมื่อไหร่:
 * - เช็คใน event handler ก่อนทำอะไร
 * - conditional logic ใน utility functions
 * - validate ก่อน call mobile-specific APIs
 * 
 * ตัวอย่าง:
 * if (isMobile()) {
 *   showMobileMenu();
 * }
 * 
 * @param width - ความกว้าง (ถ้าไม่ใส่จะใช้ window.innerWidth)
 * @returns {boolean} true ถ้า < 768px
 */
export const isMobile = (width: number = window?.innerWidth || 1200): boolean => {
  return width < 768;
};

/**
 * 📱 เช็คว่าเป็น tablet หรือไม่ (768px - 1024px)
 */
export const isTablet = (width: number = window?.innerWidth || 1200): boolean => {
  return width >= 768 && width < 1024;
};

/**
 * 💻 เช็คว่าเป็น desktop หรือไม่ (> 1024px)
 */
export const isDesktop = (width: number = window?.innerWidth || 1200): boolean => {
  return width >= 1024;
};

/**
 * 🎯 ได้ประเภทอุปกรณ์จากความกว้าง
 * 
 * ตัวอย่าง:
 * const deviceType = getDeviceType(375); // 'mobile'
 * 
 * @param width - ความกว้าง
 * @returns {DeviceType} 'mobile' | 'tablet' | 'desktop'
 */
export const getDeviceType = (width: number = window?.innerWidth || 1200): DeviceType => {
  if (isMobile(width)) return 'mobile';
  if (isTablet(width)) return 'tablet';
  return 'desktop';
};

/**
 * 📐 คำนวณความสูงที่เหลือหลังจากหัก elements อื่น
 * 
 * ใช้เมื่อไหร่:
 * - คำนวณใน utility function (ไม่ใช่ React component)
 * - ใช้ครั้งเดียวไม่ต้อง real-time update
 * 
 * ⚠️ หมายเหตุ: การคำนวณแบบ fixed (แบบที่คุณทำ) มักจะดีกว่า
 * 
 * ตัวอย่าง:
 * const height = calculateAvailableHeight(['.header', '.footer'], 20);
 * 
 * @param excludeSelectors - CSS selectors ของ elements ที่ต้องการหักออก
 * @param bufferHeight - buffer เผื่อไว้
 * @returns {number} ความสูงที่เหลือ
 */
export const calculateAvailableHeight = (
  excludeSelectors: string[] = [],
  bufferHeight: number = 20
): number => {
  if (typeof window === 'undefined') return 400;
  
  let usedHeight = bufferHeight;
  
  excludeSelectors.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      usedHeight += rect.height;
    }
  });
  
  return window.innerHeight - usedHeight;
};

/**
 * 🎨 เลือกค่าตาม breakpoint (Advanced utility)
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการค่าที่แตกต่างกันตาม breakpoint
 * - สร้าง responsive configuration
 * 
 * ตัวอย่าง:
 * const pageSize = getResponsiveValue(
 *   { xs: 3, sm: 5, lg: 10, xl: 15 },
 *   'lg',
 *   10
 * ); // จะได้ 10
 * 
 * @param values - object ที่มี key เป็น breakpoint
 * @param currentBreakpoint - breakpoint ปัจจุบัน
 * @param fallback - ค่า default
 * @returns {T} ค่าที่เหมาะสมกับ breakpoint
 */
export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  fallback: T
): T => {
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Check current and smaller breakpoints
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return fallback;
};

/**
 * 📺 สร้าง CSS media query string (Advanced utility)
 * 
 * ใช้เมื่อไหร่:
 * - สร้าง dynamic CSS
 * - ใช้กับ styled-components หรือ CSS-in-JS
 * 
 * ตัวอย่าง:
 * const mediaQuery = createMediaQuery('md'); 
 * // "(min-width: 768px) and (max-width: 991px)"
 * 
 * @param breakpoint - breakpoint ที่ต้องการ
 * @returns {string} CSS media query string
 */
export const createMediaQuery = (breakpoint: Breakpoint): string => {
  const breakpoints = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 991px)',
    lg: '(min-width: 992px) and (max-width: 1199px)',
    xl: '(min-width: 1200px) and (max-width: 1599px)',
    xxl: '(min-width: 1600px)'
  };
  
  return breakpoints[breakpoint];
};

/**
 * 🔍 เช็คว่า media query ตรงกับหน้าจอปัจจุบันหรือไม่
 * 
 * ใช้เมื่อไหร่:
 * - เช็ค media query แบบ real-time
 * - ใช้ร่วมกับ createMediaQuery
 * 
 * ตัวอย่าง:
 * const isMdScreen = matchMediaQuery('(min-width: 768px)');
 * 
 * @param query - CSS media query string
 * @returns {boolean} true ถ้าตรงกับหน้าจอปัจจุบัน
 */
export const matchMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
};