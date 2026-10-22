<template>
  <view class="container">
    <view class="month-header card flex-between">
      <view class="btn-outline btn-sm" @click="prevMonth">◀</view>
      <text class="text-lg text-bold">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="btn-outline btn-sm" @click="nextMonth">▶</view>
    </view>
    <view class="flex-row mb-24">
      <view :class="'tab ' + (viewMode==='month'?'active':'')" @click="viewMode='month'">月视图</view>
      <view :class="'tab ' + (viewMode==='week'?'active':'')" @click="viewMode='week'">周视图</view>
    </view>

    <view v-if="viewMode==='month'" class="month-calendar card">
      <view class="weekday-row"><text v-for="d in weekDays" :key="d" class="weekday">{{ d }}</text></view>
      <view class="calendar-grid">
        <view v-for="(d,idx) in calendarDays" :key="idx"
          :class="'day-cell ' + (d.isToday?'today ':'') + (!d.isCurrentMonth?'other-month ':'') + (d.date===selectedDate?'selected':'')"
          @click="selectDay(d.date)">
          <text class="day-num">{{ d.day }}</text>
          <view v-if="d.hasCourse" class="course-dot" />
        </view>
      </view>
    </view>

    <view v-if="viewMode==='week'" class="week-calendar card">
      <view class="weekday-row">
        <view v-for="w in weekView" :key="w.date" :class="'weekday-item ' + (w.isToday?'today ':'') + (w.date===selectedDate?'selected':'')" @click="selectDay(w.date)">
          <text>{{ w.weekday }}</text><text class="day-num">{{ w.day }}</text>
          <view v-if="w.hasCourse" class="course-dot" />
        </view>
      </view>
    </view>

    <view class="flex-row mt-24 mb-24"><view class="btn-primary flex-1" @click="goToCreate">+ 新建排课</view></view>

    <text class="text-bold mb-24">{{ selectedDate }} 课程 ({{ todayCourses.length }})</text>
    <view v-if="todayCourses.length===0" class="empty-box"><text>📅</text><text class="text-sm text-gray">当天没有课程</text></view>
    <view v-for="c in todayCourses" :key="c.id" class="card" @click="goToDetail(c.id)">
      <view class="flex-between">
        <view><text class="text-bold" style="font-size:32rpx;">{{ c.subject }}</text><text class="tag tag-green ml-12">{{ c.status==='scheduled'?'待上':c.status==='completed'?'已完成':'已取消' }}</text></view>
        <text style="color:#4F46E5;">{{ c.start_time.slice(11,16) }} ~ {{ c.end_time.slice(11,16) }}</text>
      </view>
      <view class="mt-12 text-sm text-gray">
        <text>👩‍🏫 {{ c.teacher_name }}</text><text class="ml-12">👨‍🎓 {{ c.student_name }}</text>
        <text class="ml-12" v-if="c.location">📍 {{ c.location }}</text>
      </view>
    </view>

    <bottom-nav role="admin" active="schedule" />
  </view>
</template>

<script>
import { getCourses } from '../../../utils/api';

function fmtDate(y,m,d) { return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

export default {
  data() { return { viewMode:'month', currentYear:2026, currentMonth:7, selectedDate:'', weekDays:['日','一','二','三','四','五','六'], calendarDays:[], weekView:[], todayCourses:[], allCoursesInMonth:[] }; },
  mounted() { this.init(); },
  onShow() { this.init(); },
  methods: {
    init() {
      const n = new Date(); this.currentYear = n.getFullYear(); this.currentMonth = n.getMonth()+1;
      this.selectedDate = fmtDate(n.getFullYear(), n.getMonth()+1, n.getDate()); this.loadMonthData();
    },
    async loadMonthData() {
      try { const r = await getCourses({ month: `${this.currentYear}-${String(this.currentMonth).padStart(2,'0')}` }); this.allCoursesInMonth = r.courses || []; } catch(e){}
      this.buildCalendar(); this.loadTodayCourses();
    },
    buildCalendar() {
      const today = new Date(); const todayStr = fmtDate(today.getFullYear(), today.getMonth()+1, today.getDate());
      const cd = new Set(); this.allCoursesInMonth.forEach(c => { const d = (c.start_time||'').slice(0,10); if(d) cd.add(d); });
      const first = new Date(this.currentYear, this.currentMonth-1, 1);
      const last = new Date(this.currentYear, this.currentMonth, 0);
      const days = [];
      for (let i = first.getDay()-1; i >= 0; i--) { const d = new Date(this.currentYear, this.currentMonth-1, -i); const ds = fmtDate(d.getFullYear(), d.getMonth()+1, d.getDate()); days.push({ day:d.getDate(), date:ds, isCurrentMonth:false, isToday:ds===todayStr, hasCourse:cd.has(ds) }); }
      for (let i=1; i<=last.getDate(); i++) { const ds = fmtDate(this.currentYear, this.currentMonth, i); days.push({ day:i, date:ds, isCurrentMonth:true, isToday:ds===todayStr, hasCourse:cd.has(ds) }); }
      const rem = 7-(days.length%7); if (rem<7) { for (let i=1; i<=rem; i++) { const m = this.currentMonth+1>12?1:this.currentMonth+1; const ds = fmtDate(m>1?this.currentYear:this.currentYear+1, m, i); days.push({ day:i, date:ds, isCurrentMonth:false, isToday:ds===todayStr, hasCourse:cd.has(ds) }); } }
      this.calendarDays = days; this.buildWeekView();
    },
    buildWeekView() {
      const cd = new Set(); this.allCoursesInMonth.forEach(c => { const d=(c.start_time||'').slice(0,10); if(d) cd.add(d); });
      const base = new Date(this.selectedDate); const mon = new Date(base); mon.setDate(base.getDate()-base.getDay());
      const today = new Date(); const todayStr = fmtDate(today.getFullYear(), today.getMonth()+1, today.getDate());
      const wd = ['日','一','二','三','四','五','六']; const w = [];
      for (let i=0; i<7; i++) { const d = new Date(mon); d.setDate(mon.getDate()+i); const ds = fmtDate(d.getFullYear(), d.getMonth()+1, d.getDate()); w.push({ day:d.getDate(), date:ds, weekday:wd[d.getDay()], isToday:ds===todayStr, hasCourse:cd.has(ds) }); }
      this.weekView = w;
    },
    async loadTodayCourses() { try { const r = await getCourses({ date: this.selectedDate }); this.todayCourses = r.courses || []; } catch(e){} },
    selectDay(date) { this.selectedDate = date; this.buildWeekView(); this.loadTodayCourses(); },
    prevMonth() { if (this.currentMonth===1) { this.currentYear--; this.currentMonth=12; } else this.currentMonth--; this.loadMonthData(); },
    nextMonth() { if (this.currentMonth===12) { this.currentYear++; this.currentMonth=1; } else this.currentMonth++; this.loadMonthData(); },
    goToCreate() { uni.navigateTo({ url:'/pages/schedule/create/create' }); },
    goToDetail(id) { uni.navigateTo({ url:`/pages/schedule/detail/detail?id=${id}` }); },
    goTo(p) { const m = { dashboard:'/pages/admin/dashboard/dashboard', teachers:'/pages/admin/teachers/teachers', students:'/pages/admin/students/students' }; uni.navigateTo({ url:m[p] }); }
  }
};
</script>

<style scoped>
.container { padding-bottom: 120rpx; }
.month-header { margin-bottom: 24rpx; }
.tab { padding: 12rpx 32rpx; font-size: 26rpx; border-radius: 8rpx; margin-right: 16rpx; background:#F3F4F6; color:#6B7280; }
.tab.active { background:#4F46E5; color:#FFF; }
.weekday-row { display: flex; }
.weekday { flex:1; text-align:center; font-size:24rpx; color:#9CA3AF; padding:12rpx 0; }
.calendar-grid { display: grid; grid-template-columns: repeat(7,1fr); }
.day-cell { aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:12rpx; position:relative; }
.day-cell.today { background:#EFF6FF; }
.day-cell.selected { background:#4F46E5; color:#FFF; }
.day-cell.other-month { opacity:0.3; }
.day-num { font-size:28rpx; }
.course-dot { width:8rpx; height:8rpx; border-radius:50%; background:#4F46E5; margin-top:4rpx; }
.weekday-item { flex:1; text-align:center; padding:16rpx 0; border-radius:12rpx; font-size:24rpx; display:flex; flex-direction:column; align-items:center; }
.weekday-item.today { background:#EFF6FF; }
.weekday-item.selected { background:#4F46E5; color:#FFF; }
</style>
