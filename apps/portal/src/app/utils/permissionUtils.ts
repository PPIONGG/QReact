import { MenuItem } from "../types";
import { User } from "../types/auth.types";

export const filterMenuByPermission = (
  menuItems: MenuItem[], 
  allowedPrograms: string[]
): MenuItem[] => {
  return menuItems.map(item => {
    // ถ้าเป็น parent menu และมี subItems
    if (item.subItems && item.subItems.length > 0) {
      // กรอง subItems ตาม permission
      const filteredSubItems = item.subItems.filter(subItem => 
        allowedPrograms.includes(subItem.id)
      );
      
      // ถ้ามี subItems ที่ผ่าน permission ให้แสดง parent menu
      if (filteredSubItems.length > 0) {
        return {
          ...item,
          subItems: filteredSubItems
        };
      }
      // ถ้าไม่มี subItems ที่ผ่าน permission ให้ return null
      return null;
    }
    // ถ้าเป็น single menu item (เช่น home)
    return item.id === 'home' || allowedPrograms.includes(item.id) ? item : null;
  }).filter(item => item !== null) as MenuItem[];
};

export const getAllProgramNames = (menuItems: MenuItem[]): string[] => {
  const programs: string[] = [];
  
  menuItems.forEach(item => {
    if (item.subItems && item.subItems.length > 0) {
      // ถ้ามี subItems ให้ดึง id ของ subItems
      item.subItems.forEach(subItem => {
        programs.push(subItem.id);
      });
    } else if (item.id !== 'home') {
      // ถ้าไม่มี subItems และไม่ใช่ home ให้ดึง id
      programs.push(item.id);
    }
  });
  
  return programs;
};

export const checkPermission = (
  user: User | null,
  selectedCompanyCode: string | null,
  programName: string
): boolean => {
  if (!user || !selectedCompanyCode) return false;

  // หาบริษัทที่เลือก
  const selectedCompany = user.company.find(
    (company) => company.companyCode === selectedCompanyCode
  );

  if (!selectedCompany) return false;

  // ถ้ามี allPermission = true ให้เข้าถึงได้ทั้งหมด
  if (selectedCompany.allPermission) return true;

  // เช็คสิทธิ์จาก accessPermission
  return selectedCompany.accessPermission.some((permission) =>
    permission.programName.includes(programName)
  );
};

