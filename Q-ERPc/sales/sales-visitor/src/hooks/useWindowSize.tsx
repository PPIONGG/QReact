import { useState, useEffect } from 'react';

/**
 * Custom hooks สำหรับจัดการขนาดหน้าจอและ responsive design
 * 
 * การใช้งาน:
 * - useWindowSize(): ติดตามขนาดหน้าจอแบบ real-time
 * - useBreakpoint(): เช็คขนาดหน้าจอตาม Ant Design breakpoints
 * - useDeviceType(): เช็คประเภทอุปกรณ์ (mobile, tablet, desktop)
 * - useScreenInfo(): ข้อมูลหน้าจอทั้งหมด (ใช้ตอน debug หรือต้องการรายละเอียด)
 * - useDynamicHeight(): คำนวณความสูงแบบ dynamic (ใช้เมื่อต้องการ scroll ที่พอดี)
 */

// Types
export interface WindowSize {
  width: number;   // ความกว้างของ viewport
  height: number;  // ความสูงของ viewport
}

export interface ScreenInfo extends WindowSize {
  availableWidth: number;   // ความกว้างที่ใช้ได้จริง (ไม่รวม taskbar)
  availableHeight: number;  // ความสูงที่ใช้ได้จริง (ไม่รวม taskbar)
  screenWidth: number;      // ความกว้างหน้าจอทั้งหมด
  screenHeight: number;     // ความสูงหน้าจอทั้งหมด
  pixelRatio: number;       // อัตราส่วน pixel (สำหรับ retina display)
  orientation: 'landscape' | 'portrait'; // แนวของหน้าจอ
}

// Breakpoints ตาม Ant Design
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
// xs: <576px, sm: 576-768px, md: 768-992px, lg: 992-1200px, xl: 1200-1600px, xxl: >1600px

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;    // < 768px
  isTablet: boolean;    // 768px - 1024px
  isDesktop: boolean;   // > 1024px
  deviceType: DeviceType;
  breakpoint: Breakpoint;
}

/**
 * 🔥 Hook หลักสำหรับติดตามขนาดหน้าจอ
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการขนาดหน้าจอแบบ real-time
 * - ทำ responsive design
 * - คำนวณขนาด component ตามหน้าจอ
 * 
 * ตัวอย่าง:
 * const windowSize = useWindowSize();
 * const tableHeight = windowSize.height - 200; // หักส่วน header
 * 
 * @returns {WindowSize} { width, height }
 */
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * 📱 Hook สำหรับข้อมูลหน้าจอทั้งหมด
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการข้อมูลหน้าจอแบบละเอียด
 * - Debug responsive issues
 * - เช็ค retina display (pixelRatio)
 * - เช็ค orientation (แนวตั้ง/แนวนอน)
 * 
 * ตัวอย่าง:
 * const screenInfo = useScreenInfo();
 * if (screenInfo.orientation === 'portrait') { ... }
 * 
 * @returns {ScreenInfo} ข้อมูลหน้าจอทั้งหมด
 */
export const useScreenInfo = (): ScreenInfo => {
  const { width, height } = useWindowSize();
  
  return {
    width,
    height,
    availableWidth: typeof window !== 'undefined' ? window.screen.availWidth : width,
    availableHeight: typeof window !== 'undefined' ? window.screen.availHeight : height,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : width,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : height,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    orientation: width > height ? 'landscape' : 'portrait'
  };
};

/**
 * 📏 Hook สำหรับเช็ค breakpoint ตาม Ant Design
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการแสดง/ซ่อน content ตาม breakpoint
 * - ปรับ layout ตามขนาดหน้าจอ
 * - ใช้ร่วมกับ Ant Design Grid system
 * 
 * ตัวอย่าง:
 * const breakpoint = useBreakpoint();
 * const columns = breakpoint === 'xs' ? 1 : breakpoint === 'sm' ? 2 : 3;
 * 
 * @returns {Breakpoint} 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
 */
export const useBreakpoint = (): Breakpoint => {
  const { width } = useWindowSize();
  
  const getBreakpoint = (width: number): Breakpoint => {
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1600) return 'xl';
    return 'xxl';
  };
  
  return getBreakpoint(width);
};

/**
 * 💻📱 Hook สำหรับเช็คประเภทอุปกรณ์
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการ UI ที่แตกต่างกันระหว่าง mobile/tablet/desktop
 * - ซ่อน/แสดง features ตามอุปกรณ์
 * - ปรับ UX ให้เหมาะกับแต่ละอุปกรณ์
 * 
 * ตัวอย่าง:
 * const { isMobile, isDesktop } = useDeviceType();
 * const pageSize = isMobile ? 5 : 10;
 * const showSidebar = !isMobile;
 * 
 * @returns {DeviceInfo} { isMobile, isTablet, isDesktop, deviceType, breakpoint }
 */
export const useDeviceType = (): DeviceInfo => {
  const { width } = useWindowSize();
  const breakpoint = useBreakpoint();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    breakpoint
  };
};

/**
 * 📐 Hook สำหรับคำนวณความสูงแบบ dynamic
 * 
 * ใช้เมื่อไหร่:
 * - ต้องการ Table หรือ content ที่มี scroll พอดีหน้าจอ
 * - ไม่อยากใช้ fixed height
 * - ต้องการหักความสูงของ elements อื่น
 * 
 * ⚠️ หมายเหตุ: การใช้งานแบบคุณ (fixed calculation) ดีกว่าในหลายกรณี
 * 
 * ตัวอย่าง:
 * const tableHeight = useDynamicHeight(['.header', '.footer'], 400, 20);
 * <Table scroll={{ y: tableHeight }} />
 * 
 * @param excludeSelectors - CSS selectors ของ elements ที่ต้องการหักออก
 * @param minHeight - ความสูงต่ำสุด (default: 300px)
 * @param bufferHeight - buffer เผื่อไว้ (default: 20px)
 * @returns {number} ความสูงที่คำนวณได้
 */
export const useDynamicHeight = (
  excludeSelectors: string[] = [],
  minHeight: number = 300,
  bufferHeight: number = 20
): number => {
  const [availableHeight, setAvailableHeight] = useState(minHeight);
  const { height } = useWindowSize();
  
  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window === 'undefined') return;
      
      let usedHeight = bufferHeight;
      
      excludeSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          usedHeight += rect.height;
        }
      });
      
      const calculatedHeight = height - usedHeight;
      setAvailableHeight(Math.max(minHeight, calculatedHeight));
    };
    
    // Delay calculation to ensure DOM is ready
    const timeoutId = setTimeout(calculateHeight, 100);
    
    return () => clearTimeout(timeoutId);
  }, [height, excludeSelectors, minHeight, bufferHeight]);
  
  return availableHeight;
};

/**
 * 🛠️ Utility functions (ใช้ได้โดยไม่ต้องเป็น React component)
 * 
 * ใช้เมื่อไหร่:
 * - ใน utility functions ที่ไม่ใช่ React component
 * - ใน class components
 * - เช็คแบบ one-time ไม่ต้อง real-time
 * 
 * ตัวอย่าง:
 * const currentBreakpoint = getBreakpointFromWidth(1920); // 'xxl'
 * const isPhone = isMobileWidth(375); // true
 */

// Utility functions that can be used without hooks
export const getBreakpointFromWidth = (width: number): Breakpoint => {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  if (width < 1600) return 'xl';
  return 'xxl';
};

export const isMobileWidth = (width: number): boolean => width < 768;
export const isTabletWidth = (width: number): boolean => width >= 768 && width < 1024;
export const isDesktopWidth = (width: number): boolean => width >= 1024;