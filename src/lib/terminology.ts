/**
 * 术语库 - 医疗行业专用翻译词典
 * 支持持久化存储和增删改查
 */

export type TermCategory = 'general' | 'medical' | 'infusion' | 'flowchart' | 'custom';

export interface TermMapping {
  id: string;
  cn: string;
  en: string;
  th?: string; // 泰文翻译（可选）
  category: TermCategory;
  isCustom?: boolean;
  originalId?: string; // 当编辑内置术语时，标记原始术语ID
}

const STORAGE_KEY = 'custom-terminology';
const HIDDEN_KEY = 'hidden-terminology';

// 内置术语库
const defaultTerms: TermMapping[] = [
  // 通用界面元素
  { id: 'gen-1', cn: '新建', en: 'New', th: 'สร้างใหม่', category: 'general' },
  { id: 'gen-2', cn: '新建任务', en: 'New Task', th: 'สร้างงานใหม่', category: 'general' },
  { id: 'gen-3', cn: '编辑', en: 'Edit', th: 'แก้ไข', category: 'general' },
  { id: 'gen-4', cn: '删除', en: 'Delete', th: 'ลบ', category: 'general' },
  { id: 'gen-5', cn: '保存', en: 'Save', th: 'บันทึก', category: 'general' },
  { id: 'gen-6', cn: '取消', en: 'Cancel', th: 'ยกเลิก', category: 'general' },
  { id: 'gen-7', cn: '确认', en: 'Confirm', th: 'ยืนยัน', category: 'general' },
  { id: 'gen-8', cn: '搜索', en: 'Search', th: 'ค้นหา', category: 'general' },
  { id: 'gen-9', cn: '设置', en: 'Settings', th: 'การตั้งค่า', category: 'general' },
  { id: 'gen-10', cn: '提交', en: 'Submit', th: 'ส่ง', category: 'general' },
  { id: 'gen-11', cn: '重置', en: 'Reset', th: 'รีเซ็ต', category: 'general' },
  { id: 'gen-12', cn: '刷新', en: 'Refresh', th: 'รีเฟรช', category: 'general' },
  { id: 'gen-13', cn: '导出', en: 'Export', th: 'ส่งออก', category: 'general' },
  { id: 'gen-14', cn: '导入', en: 'Import', th: 'นำเข้า', category: 'general' },
  { id: 'gen-15', cn: '下载', en: 'Download', th: 'ดาวน์โหลด', category: 'general' },
  { id: 'gen-16', cn: '上传', en: 'Upload', th: 'อัปโหลด', category: 'general' },
  { id: 'gen-17', cn: '预览', en: 'Preview', th: 'แสดงตัวอย่าง', category: 'general' },
  { id: 'gen-18', cn: '详情', en: 'Details', th: 'รายละเอียด', category: 'general' },
  { id: 'gen-19', cn: '返回', en: 'Back', th: 'กลับ', category: 'general' },
  { id: 'gen-20', cn: '关闭', en: 'Close', th: 'ปิด', category: 'general' },
  { id: 'gen-21', cn: '完成', en: 'Complete', th: 'เสร็จสิ้น', category: 'general' },
  { id: 'gen-22', cn: '下一步', en: 'Next', th: 'ถัดไป', category: 'general' },
  { id: 'gen-23', cn: '上一步', en: 'Previous', th: 'ก่อนหน้า', category: 'general' },
  { id: 'gen-24', cn: '首页', en: 'Home', th: 'หน้าแรก', category: 'general' },
  { id: 'gen-25', cn: '登录', en: 'Login', th: 'เข้าสู่ระบบ', category: 'general' },
  { id: 'gen-26', cn: '退出', en: 'Logout', th: 'ออกจากระบบ', category: 'general' },
  { id: 'gen-27', cn: '注册', en: 'Register', th: 'ลงทะเบียน', category: 'general' },
  { id: 'gen-28', cn: '用户', en: 'User', th: 'ผู้ใช้', category: 'general' },
  { id: 'gen-29', cn: '管理员', en: 'Admin', th: 'ผู้ดูแล', category: 'general' },
  { id: 'gen-30', cn: '系统', en: 'System', th: 'ระบบ', category: 'general' },
  { id: 'gen-31', cn: '帮助', en: 'Help', th: 'ช่วยเหลือ', category: 'general' },
  { id: 'gen-32', cn: '关于', en: 'About', th: 'เกี่ยวกับ', category: 'general' },
  { id: 'gen-33', cn: '语言', en: 'Language', th: 'ภาษา', category: 'general' },
  { id: 'gen-34', cn: '主题', en: 'Theme', th: 'ธีม', category: 'general' },
  { id: 'gen-35', cn: '通知', en: 'Notification', th: 'การแจ้งเตือน', category: 'general' },
  { id: 'gen-36', cn: '消息', en: 'Message', th: 'ข้อความ', category: 'general' },
  { id: 'gen-37', cn: '提示', en: 'Tip', th: 'เคล็ดลับ', category: 'general' },
  { id: 'gen-38', cn: '警告', en: 'Warning', th: 'คำเตือน', category: 'general' },
  { id: 'gen-39', cn: '错误', en: 'Error', th: 'ข้อผิดพลาด', category: 'general' },
  { id: 'gen-40', cn: '成功', en: 'Success', th: 'สำเร็จ', category: 'general' },
  { id: 'gen-41', cn: '失败', en: 'Failed', th: 'ล้มเหลว', category: 'general' },
  { id: 'gen-42', cn: '处理中', en: 'Processing', th: 'กำลังประมวลผล', category: 'general' },
  { id: 'gen-43', cn: '等待中', en: 'Waiting', th: 'รอคิว', category: 'general' },
  { id: 'gen-44', cn: '全部', en: 'All', th: 'ทั้งหมด', category: 'general' },
  { id: 'gen-45', cn: '筛选', en: 'Filter', th: 'กรอง', category: 'general' },
  { id: 'gen-46', cn: '排序', en: 'Sort', th: 'เรียงลำดับ', category: 'general' },

  // 医疗/药品行业
  { id: 'med-1', cn: '患者', en: 'Patient', th: 'ผู้ป่วย', category: 'medical' },
  { id: 'med-2', cn: '病人', en: 'Patient', th: 'ผู้ป่วย', category: 'medical' },
  { id: 'med-3', cn: '医生', en: 'Doctor', th: 'แพทย์', category: 'medical' },
  { id: 'med-4', cn: '护士', en: 'Nurse', th: 'พยาบาล', category: 'medical' },
  { id: 'med-5', cn: '药品', en: 'Medication', th: 'ยา', category: 'medical' },
  { id: 'med-6', cn: '药物', en: 'Medication', th: 'ยา', category: 'medical' },
  { id: 'med-7', cn: '医嘱', en: 'Medical Order', th: 'ใบสั่งแพทย์', category: 'medical' },
  { id: 'med-8', cn: '处方', en: 'Prescription', th: 'ใบสั่งยา', category: 'medical' },
  { id: 'med-9', cn: '输液', en: 'Infusion', th: 'การฉีดยา', category: 'medical' },
  { id: 'med-10', cn: '注射', en: 'Injection', th: 'การฉีด', category: 'medical' },
  { id: 'med-11', cn: '静脉', en: 'Intravenous', th: 'เส้นเลือดดำ', category: 'medical' },
  { id: 'med-12', cn: '剂量', en: 'Dosage', th: 'ขนาดยา', category: 'medical' },
  { id: 'med-13', cn: '用药', en: 'Medication', th: 'การใช้ยา', category: 'medical' },
  { id: 'med-14', cn: '疗程', en: 'Treatment Course', th: 'คอร์สการรักษา', category: 'medical' },
  { id: 'med-15', cn: '病房', en: 'Ward', th: 'หอผู้ป่วย', category: 'medical' },
  { id: 'med-16', cn: '病床', en: 'Bed', th: 'เตียง', category: 'medical' },
  { id: 'med-17', cn: '科室', en: 'Department', th: 'แผนก', category: 'medical' },
  { id: 'med-18', cn: '急诊', en: 'Emergency', th: 'ฉุกเฉิน', category: 'medical' },
  { id: 'med-19', cn: '门诊', en: 'Outpatient', th: 'ผู้ป่วยนอก', category: 'medical' },
  { id: 'med-20', cn: '住院', en: 'Inpatient', th: 'ผู้ป่วยใน', category: 'medical' },
  { id: 'med-21', cn: '手术', en: 'Surgery', th: 'การผ่าตัด', category: 'medical' },
  { id: 'med-22', cn: '麻醉', en: 'Anesthesia', th: 'การวางยาชา', category: 'medical' },
  { id: 'med-23', cn: '监护', en: 'Monitoring', th: 'การเฝ้าติดตาม', category: 'medical' },
  { id: 'med-24', cn: '生命体征', en: 'Vital Signs', th: 'สัญญาณชีพ', category: 'medical' },
  { id: 'med-25', cn: '血压', en: 'Blood Pressure', th: 'ความดันโลหิต', category: 'medical' },
  { id: 'med-26', cn: '心率', en: 'Heart Rate', th: 'อัตราการเต้นของหัวใจ', category: 'medical' },
  { id: 'med-27', cn: '体温', en: 'Body Temperature', th: 'อุณหภูมิร่างกาย', category: 'medical' },
  { id: 'med-28', cn: '呼吸', en: 'Respiration', th: 'การหายใจ', category: 'medical' },
  { id: 'med-29', cn: '血氧', en: 'Blood Oxygen', th: 'ออกซิเจนในเลือด', category: 'medical' },
  { id: 'med-30', cn: '过敏', en: 'Allergy', th: 'การแพ้', category: 'medical' },
  { id: 'med-31', cn: '副作用', en: 'Side Effect', th: 'ผลข้างเคียง', category: 'medical' },
  { id: 'med-32', cn: '禁忌', en: 'Contraindication', th: 'ข้อห้าม', category: 'medical' },
  { id: 'med-33', cn: '适应症', en: 'Indication', th: 'ข้อบ่งชี้', category: 'medical' },
  { id: 'med-34', cn: '临床', en: 'Clinical', th: 'ทางคลินิก', category: 'medical' },
  { id: 'med-35', cn: '诊断', en: 'Diagnosis', th: 'การวินิจฉัย', category: 'medical' },
  { id: 'med-36', cn: '症状', en: 'Symptom', th: 'อาการ', category: 'medical' },
  { id: 'med-37', cn: '治疗', en: 'Treatment', th: 'การรักษา', category: 'medical' },
  { id: 'med-38', cn: '康复', en: 'Recovery', th: 'การฟื้นตัว', category: 'medical' },
  { id: 'med-39', cn: '病理', en: 'Pathology', th: 'พยาธิวิทยา', category: 'medical' },
  { id: 'med-40', cn: '药理', en: 'Pharmacology', th: 'เภสัชวิทยา', category: 'medical' },
  { id: 'med-41', cn: '药剂', en: 'Pharmaceutical', th: 'เภสัชภัณฑ์', category: 'medical' },
  { id: 'med-42', cn: '处方药', en: 'Prescription Drug', th: 'ยาตามใบสั่งแพทย์', category: 'medical' },
  { id: 'med-43', cn: '非处方药', en: 'Over-the-Counter Drug', th: 'ยาที่ซื้อได้เอง', category: 'medical' },
  { id: 'med-44', cn: '抗生素', en: 'Antibiotic', th: 'ยาปฏิชีวนะ', category: 'medical' },
  { id: 'med-45', cn: '止痛药', en: 'Painkiller', th: 'ยาแก้ปวด', category: 'medical' },
  { id: 'med-46', cn: '镇静剂', en: 'Sedative', th: 'ยากล่อมประสาท', category: 'medical' },
  { id: 'med-47', cn: '麻醉剂', en: 'Anesthetic', th: 'ยาชา', category: 'medical' },
  { id: 'med-48', cn: '注射液', en: 'Injection Solution', th: 'สารละลายฉีด', category: 'medical' },
  { id: 'med-49', cn: '口服液', en: 'Oral Solution', th: 'สารละลายรับประทาน', category: 'medical' },
  { id: 'med-50', cn: '片剂', en: 'Tablet', th: 'ยาเม็ด', category: 'medical' },
  { id: 'med-51', cn: '胶囊', en: 'Capsule', th: 'แคปซูล', category: 'medical' },
  { id: 'med-52', cn: '滴剂', en: 'Drops', th: 'หยด', category: 'medical' },
  { id: 'med-53', cn: '滴速', en: 'Drop Rate', th: 'อัตราหยด', category: 'medical' },
  { id: 'med-54', cn: '皮重', en: 'Tare Weight', th: 'น้ำหนักเปล่า', category: 'medical' },
  { id: 'med-55', cn: '体重', en: 'Body Weight', th: 'น้ำหนักตัว', category: 'medical' },
  { id: 'med-56', cn: '身高', en: 'Body Height', th: 'ส่วนสูง', category: 'medical' },
  { id: 'med-57', cn: '年龄', en: 'Age', th: 'อายุ', category: 'medical' },
  { id: 'med-58', cn: '性别', en: 'Gender', th: 'เพศ', category: 'medical' },
  { id: 'med-59', cn: '病历', en: 'Medical Record', th: 'เวชระเบียน', category: 'medical' },
  { id: 'med-60', cn: '档案', en: 'Record', th: 'บันทึก', category: 'medical' },

  // 输液监控系统
  { id: 'inf-1', cn: '输液监控', en: 'Infusion Monitoring', th: 'การเฝ้าติดตามการฉีดยา', category: 'infusion' },
  { id: 'inf-2', cn: '输液系统', en: 'Infusion System', th: 'ระบบการฉีดยา', category: 'infusion' },
  { id: 'inf-3', cn: '输液器', en: 'Infusion Device', th: 'อุปกรณ์ฉีดยา', category: 'infusion' },
  { id: 'inf-4', cn: '输液泵', en: 'Infusion Pump', th: 'เครื่องสูบฉีดยา', category: 'infusion' },
  { id: 'inf-5', cn: '监控器', en: 'Monitor', th: 'จอมอนิเตอร์', category: 'infusion' },
  { id: 'inf-6', cn: '传感器', en: 'Sensor', th: 'เซ็นเซอร์', category: 'infusion' },
  { id: 'inf-7', cn: '报警', en: 'Alarm', th: 'สัญญาณเตือน', category: 'infusion' },
  { id: 'inf-8', cn: '预警', en: 'Warning', th: 'การเตือนล่วงหน้า', category: 'infusion' },
  { id: 'inf-9', cn: '滴数', en: 'Drop Count', th: 'จำนวนหยด', category: 'infusion' },
  { id: 'inf-10', cn: '滴数监测', en: 'Drop Count Monitoring', th: 'การเฝ้าติดตามจำนวนหยด', category: 'infusion' },
  { id: 'inf-11', cn: '液位', en: 'Fluid Level', th: 'ระดับของเหลว', category: 'infusion' },
  { id: 'inf-12', cn: '余液', en: 'Remaining Fluid', th: 'ยาที่เหลือ', category: 'infusion' },
  { id: 'inf-13', cn: '流速', en: 'Flow Rate', th: 'อัตราการไหล', category: 'infusion' },
  { id: 'inf-14', cn: '输液量', en: 'Infusion Volume', th: 'ปริมาณการฉีดยา', category: 'infusion' },
  { id: 'inf-15', cn: '已输液量', en: 'Infused Volume', th: 'ปริมาณที่ฉีดแล้ว', category: 'infusion' },
  { id: 'inf-16', cn: '剩余输液量', en: 'Remaining Infusion Volume', th: 'ปริมาณที่เหลือ', category: 'infusion' },
  { id: 'inf-17', cn: '预计完成时间', en: 'Estimated Completion Time', th: 'เวลาโดยประมาณที่เสร็จสิ้น', category: 'infusion' },
  { id: 'inf-18', cn: '开始时间', en: 'Start Time', th: 'เวลาเริ่มต้น', category: 'infusion' },
  { id: 'inf-19', cn: '结束时间', en: 'End Time', th: 'เวลาสิ้นสุด', category: 'infusion' },
  { id: 'inf-20', cn: '输液统计', en: 'Infusion Statistics', th: 'สถิติการฉีดยา', category: 'infusion' },
  { id: 'inf-21', cn: '监控记录', en: 'Monitoring Record', th: 'บันทึกการเฝ้าติดตาม', category: 'infusion' },
  { id: 'inf-22', cn: '报警记录', en: 'Alarm Record', th: 'บันทึกการแจ้งเตือน', category: 'infusion' },
  { id: 'inf-23', cn: '监控器管理', en: 'Monitor Management', th: 'การจัดการมอนิเตอร์', category: 'infusion' },
  { id: 'inf-24', cn: '设备管理', en: 'Device Management', th: 'การจัดการอุปกรณ์', category: 'infusion' },
  { id: 'inf-25', cn: '设备状态', en: 'Device Status', th: 'สถานะอุปกรณ์', category: 'infusion' },
  { id: 'inf-26', cn: '在线', en: 'Online', th: 'ออนไลน์', category: 'infusion' },
  { id: 'inf-27', cn: '离线', en: 'Offline', th: 'ออฟไลน์', category: 'infusion' },
  { id: 'inf-28', cn: '正常运行', en: 'Normal Operation', th: 'ทำงานปกติ', category: 'infusion' },
  { id: 'inf-29', cn: '异常', en: 'Abnormal', th: 'ผิดปกติ', category: 'infusion' },
  { id: 'inf-30', cn: '堵塞', en: 'Blockage', th: 'อุดตัน', category: 'infusion' },
  { id: 'inf-31', cn: '漏液', en: 'Leakage', th: 'รั่วซึม', category: 'infusion' },
  { id: 'inf-32', cn: '空瓶', en: 'Empty Bottle', th: 'ขวดเปล่า', category: 'infusion' },
  { id: 'inf-33', cn: '气泡', en: 'Air Bubble', th: 'ฟองอากาศ', category: 'infusion' },
  { id: 'inf-34', cn: '气泡检测', en: 'Air Bubble Detection', th: 'การตรวจจับฟองอากาศ', category: 'infusion' },
  { id: 'inf-35', cn: '气泡报警', en: 'Air Bubble Alarm', th: 'สัญญาณเตือนฟองอากาศ', category: 'infusion' },
  { id: 'inf-36', cn: '堵塞报警', en: 'Blockage Alarm', th: 'สัญญาณเตือนอุดตัน', category: 'infusion' },
  { id: 'inf-37', cn: '空瓶报警', en: 'Empty Bottle Alarm', th: 'สัญญาณเตือนขวดเปล่า', category: 'infusion' },
  { id: 'inf-38', cn: '异常报警', en: 'Abnormal Alarm', th: 'สัญญาณเตือนผิดปกติ', category: 'infusion' },
  { id: 'inf-39', cn: '语音播报', en: 'Voice Announcement', th: 'ประกาศเสียง', category: 'infusion' },
  { id: 'inf-40', cn: '声音提示', en: 'Audio Prompt', th: 'เสียงแจ้งเตือน', category: 'infusion' },
  { id: 'inf-41', cn: '静音', en: 'Mute', th: 'ปิดเสียง', category: 'infusion' },
  { id: 'inf-42', cn: '音量', en: 'Volume', th: 'ระดับเสียง', category: 'infusion' },
  { id: 'inf-43', cn: '亮度', en: 'Brightness', th: 'ความสว่าง', category: 'infusion' },
  { id: 'inf-44', cn: '屏幕', en: 'Screen', th: 'หน้าจอ', category: 'infusion' },
  { id: 'inf-45', cn: '显示屏', en: 'Display Screen', th: 'จอแสดงผล', category: 'infusion' },
  { id: 'inf-46', cn: '触摸屏', en: 'Touch Screen', th: 'หน้าจอสัมผัส', category: 'infusion' },
  { id: 'inf-47', cn: '按键', en: 'Button', th: 'ปุ่ม', category: 'infusion' },
  { id: 'inf-48', cn: '电源', en: 'Power', th: 'พลังงาน', category: 'infusion' },
  { id: 'inf-49', cn: '电池', en: 'Battery', th: 'แบตเตอรี่', category: 'infusion' },
  { id: 'inf-50', cn: '充电', en: 'Charging', th: 'การชาร์จ', category: 'infusion' },
  { id: 'inf-51', cn: '网络', en: 'Network', th: 'เครือข่าย', category: 'infusion' },
  { id: 'inf-52', cn: 'WiFi', en: 'WiFi', th: 'ไวไฟ', category: 'infusion' },
  { id: 'inf-53', cn: '蓝牙', en: 'Bluetooth', th: 'บลูทูธ', category: 'infusion' },
  { id: 'inf-54', cn: '数据同步', en: 'Data Synchronization', th: 'การซิงโครไนซ์ข้อมูล', category: 'infusion' },
  { id: 'inf-55', cn: '数据上传', en: 'Data Upload', th: 'อัปโหลดข้อมูล', category: 'infusion' },
  { id: 'inf-56', cn: '数据下载', en: 'Data Download', th: 'ดาวน์โหลดข้อมูล', category: 'infusion' },
  { id: 'inf-57', cn: '云端', en: 'Cloud', th: 'คลาวด์', category: 'infusion' },
  { id: 'inf-58', cn: '本地', en: 'Local', th: 'เครื่อง', category: 'infusion' },
  { id: 'inf-59', cn: '服务器', en: 'Server', th: 'เซิร์ฟเวอร์', category: 'infusion' },
  { id: 'inf-60', cn: '数据库', en: 'Database', th: 'ฐานข้อมูล', category: 'infusion' },
  { id: 'inf-61', cn: '版本', en: 'Version', th: 'เวอร์ชัน', category: 'infusion' },
  { id: 'inf-62', cn: '更新', en: 'Update', th: 'อัปเดต', category: 'infusion' },
  { id: 'inf-63', cn: '升级', en: 'Upgrade', th: 'อัปเกรด', category: 'infusion' },
  { id: 'inf-64', cn: '固件', en: 'Firmware', th: 'เฟิร์มแวร์', category: 'infusion' },
  { id: 'inf-65', cn: '序列号', en: 'Serial Number', th: 'หมายเลขซีเรียล', category: 'infusion' },
  { id: 'inf-66', cn: '设备编号', en: 'Device ID', th: 'หมายเลขอุปกรณ์', category: 'infusion' },

  // 流程图元素
  { id: 'flow-1', cn: '开始', en: 'Start', th: 'เริ่มต้น', category: 'flowchart' },
  { id: 'flow-2', cn: '结束', en: 'End', th: 'สิ้นสุด', category: 'flowchart' },
  { id: 'flow-3', cn: '流程', en: 'Process', th: 'กระบวนการ', category: 'flowchart' },
  { id: 'flow-4', cn: '步骤', en: 'Step', th: 'ขั้นตอน', category: 'flowchart' },
  { id: 'flow-5', cn: '决策', en: 'Decision', th: 'ตัดสินใจ', category: 'flowchart' },
  { id: 'flow-6', cn: '判断', en: 'Judge', th: 'การตัดสิน', category: 'flowchart' },
  { id: 'flow-7', cn: '条件', en: 'Condition', th: 'เงื่อนไข', category: 'flowchart' },
  { id: 'flow-8', cn: '是', en: 'Yes', th: 'ใช่', category: 'flowchart' },
  { id: 'flow-9', cn: '否', en: 'No', th: 'ไม่', category: 'flowchart' },
  { id: 'flow-10', cn: '获取数据', en: 'Get Data', th: 'รับข้อมูล', category: 'flowchart' },
  { id: 'flow-11', cn: '处理数据', en: 'Process Data', th: 'ประมวลผลข้อมูล', category: 'flowchart' },
  { id: 'flow-12', cn: '验证', en: 'Verify', th: 'ตรวจสอบ', category: 'flowchart' },
  { id: 'flow-13', cn: '验证通过', en: 'Verification Passed', th: 'ผ่านการตรวจสอบ', category: 'flowchart' },
  { id: 'flow-14', cn: '验证失败', en: 'Verification Failed', th: 'ไม่ผ่านการตรวจสอบ', category: 'flowchart' },
  { id: 'flow-15', cn: '存储', en: 'Store', th: 'จัดเก็บ', category: 'flowchart' },
  { id: 'flow-16', cn: '发送', en: 'Send', th: 'ส่ง', category: 'flowchart' },
  { id: 'flow-17', cn: '接收', en: 'Receive', th: 'รับ', category: 'flowchart' },
  { id: 'flow-18', cn: '返回', en: 'Return', th: 'ส่งกลับ', category: 'flowchart' },
  { id: 'flow-19', cn: '循环', en: 'Loop', th: 'วนซ้ำ', category: 'flowchart' },
  { id: 'flow-20', cn: '分支', en: 'Branch', th: 'แยก', category: 'flowchart' },
];

// ==================== 持久化操作 ====================

function getCustomTerms(): TermMapping[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomTerms(terms: TermMapping[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  // 清除缓存，下次访问时重新构建
  terminologyCache = null;
  terminologyMap = null;
  terminologyMapTh = null;
}

function getHiddenTermIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HIDDEN_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHiddenTermIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  // 清除缓存
  terminologyCache = null;
  terminologyMap = null;
  terminologyMapTh = null;
}

// ==================== 术语库缓存（O(1) 查找）====================

let terminologyCache: TermMapping[] | null = null;
let terminologyMap: Map<string, string> | null = null; // cn -> en 的 HashMap
let terminologyMapTh: Map<string, string> | null = null; // cn -> th 的 HashMap

function buildTerminologyCache(): void {
  if (terminologyCache !== null) return;

  const hiddenIds = getHiddenTermIds();
  const customTerms = getCustomTerms();

  // 过滤隐藏的术语
  const visibleDefaults = defaultTerms.filter(t => !hiddenIds.includes(t.id));

  // 合并：自定义术语 + 自定义覆盖
  terminologyCache = [...visibleDefaults, ...customTerms.filter(t => t.isCustom || t.originalId)];

  // 构建 HashMap（O(1) 查找）- 英文
  terminologyMap = new Map();
  terminologyMapTh = new Map();
  terminologyCache.forEach(term => {
    // 自定义术语优先（覆盖内置术语）
    if (!terminologyMap!.has(term.cn)) {
      terminologyMap!.set(term.cn, term.en);
    }
    // 泰文映射（如果有）
    if (term.th && !terminologyMapTh!.has(term.cn)) {
      terminologyMapTh!.set(term.cn, term.th);
    }
  });
}

// ==================== 术语库操作 ====================

export function getAllTerms(): TermMapping[] {
  if (terminologyCache === null) {
    buildTerminologyCache();
  }
  return terminologyCache!;
}

export function findTranslation(chinese: string): string | null {
  if (terminologyMap === null) {
    buildTerminologyCache();
  }
  return terminologyMap!.get(chinese) || null;
}

/**
 * 按目标语言查找翻译
 * @param chinese 中文原文
 * @param lang 目标语言 'en' | 'th'
 */
export function findTranslationByLang(chinese: string, lang: 'en' | 'th'): string | null {
  if (lang === 'th') {
    if (terminologyMapTh === null) {
      buildTerminologyCache();
    }
    return terminologyMapTh!.get(chinese) || null;
  }
  return findTranslation(chinese);
}

export function findTerm(chinese: string): TermMapping | null {
  if (terminologyCache === null) {
    buildTerminologyCache();
  }
  return terminologyCache!.find(t => t.cn === chinese) || null;
}

export function findTermsInText(text: string): TermMapping[] {
  if (terminologyCache === null) {
    buildTerminologyCache();
  }
  // 过滤包含术语的项
  return terminologyCache!.filter(t => text.includes(t.cn));
}

export function getTermsByCategory(category: TermCategory): TermMapping[] {
  if (terminologyCache === null) {
    buildTerminologyCache();
  }
  return terminologyCache!.filter(t => t.category === category);
}

export function getTerminologyStats() {
  const custom = getCustomTerms();
  const hiddenIds = getHiddenTermIds();
  const allTerms = getAllTerms();
  const byCategory: Record<string, number> = {
    general: 0,
    medical: 0,
    infusion: 0,
    flowchart: 0,
    custom: custom.length,
  };
  allTerms.forEach(t => {
    if (!t.id.startsWith('gen-') && !t.id.startsWith('med-') && !t.id.startsWith('inf-') && !t.id.startsWith('flow-')) {
      // 这是自定义或覆盖的术语
    } else {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    }
  });
  return {
    total: allTerms.length,
    byCategory,
    customCount: custom.length,
    hiddenCount: hiddenIds.length,
  };
}

// ==================== CRUD 操作 ====================

export function addTerm(term: Omit<TermMapping, 'id' | 'isCustom'>): { success: boolean; error?: string; id?: string } {
  const allTerms = getAllTerms();

  // 检查是否已存在相同中文术语
  if (allTerms.some(t => t.cn === term.cn)) {
    return { success: false, error: '该中文术语已存在' };
  }

  const newTerm: TermMapping = {
    ...term,
    id: `custom-${Date.now()}`,
    isCustom: true,
  };

  const customTerms = getCustomTerms();
  customTerms.push(newTerm);
  saveCustomTerms(customTerms);

  return { success: true, id: newTerm.id };
}

export function updateTerm(id: string, updates: Partial<Pick<TermMapping, 'cn' | 'en' | 'category'>>): { success: boolean; error?: string } {
  const customTerms = getCustomTerms();
  const builtIn = defaultTerms.find(t => t.id === id);

  // 查找是否已经是自定义术语
  let customIndex = customTerms.findIndex(t => t.id === id);

  if (builtIn) {
    // 内置术语：创建或更新覆盖版本
    const overrideTerm: TermMapping = {
      ...builtIn,
      ...updates,
      id: `override-${id}-${Date.now()}`,
      isCustom: true,
      originalId: id, // 标记原始内置术语ID
    };

    if (customIndex !== -1) {
      // 已有过编辑覆盖，更新它
      customTerms[customIndex] = overrideTerm;
    } else {
      customTerms.push(overrideTerm);
    }
  } else {
    // 自定义术语
    if (customIndex === -1) {
      return { success: false, error: '术语不存在' };
    }

    // 如果更新中文术语，检查是否与其他术语冲突
    if (updates.cn && updates.cn !== customTerms[customIndex].cn) {
      const allTerms = getAllTerms();
      if (allTerms.some(t => t.cn === updates.cn && t.id !== id)) {
        return { success: false, error: '该中文术语已存在' };
      }
    }

    customTerms[customIndex] = { ...customTerms[customIndex], ...updates };
  }

  saveCustomTerms(customTerms);
  return { success: true };
}

export function deleteTerm(id: string): { success: boolean; error?: string } {
  const customTerms = getCustomTerms();
  const builtIn = defaultTerms.find(t => t.id === id);

  if (builtIn) {
    // 内置术语：添加到隐藏列表
    const hiddenIds = getHiddenTermIds();
    if (!hiddenIds.includes(id)) {
      hiddenIds.push(id);
      saveHiddenTermIds(hiddenIds);
    }
  } else {
    // 自定义术语：直接删除
    const index = customTerms.findIndex(t => t.id === id);
    if (index !== -1) {
      customTerms.splice(index, 1);
      saveCustomTerms(customTerms);
    }
  }

  return { success: true };
}

export function restoreTerm(id: string): { success: boolean; error?: string } {
  const hiddenIds = getHiddenTermIds();
  const index = hiddenIds.indexOf(id);

  if (index !== -1) {
    hiddenIds.splice(index, 1);
    saveHiddenTermIds(hiddenIds);
    return { success: true };
  }

  return { success: false, error: '术语不在隐藏列表中' };
}

export function importTerms(terms: TermMapping[]): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;
  const customTerms = getCustomTerms();

  terms.forEach(term => {
    const allTerms = getAllTerms();
    if (allTerms.some(t => t.cn === term.cn)) {
      errors.push(`"${term.cn}" 已存在，跳过`);
      return;
    }
    if (!term.cn || !term.en) {
      errors.push(`"${term.cn || term.en || '未知'}" 缺少必要字段，跳过`);
      return;
    }

    customTerms.push({
      ...term,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      isCustom: true,
      category: term.category || 'custom',
    });
    imported++;
  });

  if (imported > 0) {
    saveCustomTerms(customTerms);
  }

  return { success: imported > 0, imported, errors };
}

export function exportTerms(): { all: TermMapping[]; custom: TermMapping[]; hidden: string[] } {
  return {
    all: getAllTerms(),
    custom: getCustomTerms(),
    hidden: getHiddenTermIds(),
  };
}

export function clearAllCustomTerms(): void {
  saveCustomTerms([]);
  saveHiddenTermIds([]);
}

export function getDefaultTerms(): TermMapping[] {
  return [...defaultTerms];
}

export function getHiddenTermIdsList(): string[] {
  return getHiddenTermIds();
}
