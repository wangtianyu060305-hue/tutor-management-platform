<template>
  <view class="container">
    <text class="text-lg text-bold mb-24">新建排课</text>
    <view class="card">
      <view class="form-group"><text class="form-label">选择老师 *</text><picker :range="teacherOptions" range-key="name" @change="onTeacherChange"><view class="form-picker">{{ teacherOptions[teacherIndex] ? teacherOptions[teacherIndex].name : '请选择老师' }}</view></picker></view>
      <view class="form-group"><text class="form-label">选择学生 *</text><picker :range="studentOptions" range-key="name" @change="onStudentChange"><view class="form-picker">{{ studentOptions[studentIndex] ? studentOptions[studentIndex].name : '请选择学生' }}</view></picker></view>
      <view class="form-group"><text class="form-label">科目 *</text><input class="form-input" v-model="subject" placeholder="如：数学" /></view>
      <view class="form-group"><text class="form-label">日期 *</text><picker mode="date" :value="dateValue" @change="onDateChange"><view class="form-picker">{{ dateValue || '请选择日期' }}</view></picker></view>
      <view class="form-group"><text class="form-label">开始时间 *</text><picker mode="time" :value="startTime" @change="onStartTimeChange"><view class="form-picker">{{ startTime || '请选择开始时间' }}</view></picker></view>
      <view class="form-group"><text class="form-label">结束时间 *</text><picker mode="time" :value="endTime" @change="onEndTimeChange"><view class="form-picker">{{ endTime || '请选择结束时间' }}</view></picker></view>
      <view class="form-group"><text class="form-label">上课地点</text><input class="form-input" v-model="location" placeholder="如：教室A / 线上" /></view>
      <view class="form-group"><text class="form-label">备注</text><textarea class="form-textarea" v-model="notes" placeholder="教学内容安排等" /></view>
      <view class="btn-primary mt-24" @click="submitCourse">确认排课</view>
    </view>
  </view>
</template>

<script>
import { getTeachers, getStudents, createCourse } from '../../../utils/api';
import { isTeacher, getUserInfo } from '../../../utils/auth';

export default {
  data() { return { teacherOptions:[], studentOptions:[], teacherIndex:0, studentIndex:0, teacherId:null, studentId:null, subject:'', dateValue:'', startTime:'09:00', endTime:'10:00', location:'', notes:'' }; },
  mounted() { const n=new Date(); this.dateValue=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; this.loadOptions(); },
  onLoad(options) { if (options && options.studentId) this.studentId = parseInt(options.studentId); if (options && options.subject) this.subject = decodeURIComponent(options.subject || ''); },
  methods: {
    async loadOptions() {
      try { const [t,s] = await Promise.all([getTeachers(), getStudents()]); this.teacherOptions = t.teachers||[]; this.studentOptions = s.students||[];
        this.studentIndex = this.studentId ? this.studentOptions.findIndex(s=>s.id===this.studentId) : 0;
        if (isTeacher()) { const u=getUserInfo(); const mi=this.teacherOptions.findIndex(t=>t.name===u.name); if(mi>=0){this.teacherIndex=mi;this.teacherId=this.teacherOptions[mi].id;} } } catch(e){}
    },
    onTeacherChange(e) { const i=parseInt(e.detail.value); this.teacherIndex=i; this.teacherId=this.teacherOptions[i]?this.teacherOptions[i].id:null; },
    onStudentChange(e) { const i=parseInt(e.detail.value); this.studentIndex=i; this.studentId=this.studentOptions[i]?this.studentOptions[i].id:null; },
    onDateChange(e) { this.dateValue = e.detail.value; },
    onStartTimeChange(e) { this.startTime = e.detail.value; },
    onEndTimeChange(e) { this.endTime = e.detail.value; },
    async submitCourse() {
      if (!this.teacherId) { uni.showToast({title:'请选择老师',icon:'none'}); return; }
      if (!this.studentId) { uni.showToast({title:'请选择学生',icon:'none'}); return; }
      if (!this.subject) { uni.showToast({title:'请输入科目',icon:'none'}); return; }
      if (!this.dateValue) { uni.showToast({title:'请选择日期',icon:'none'}); return; }
      if (!this.startTime||!this.endTime) { uni.showToast({title:'请选择时间',icon:'none'}); return; }
      if (this.endTime <= this.startTime) { uni.showToast({title:'结束时间必须晚于开始时间',icon:'none'}); return; }
      try { await createCourse({ teacher_id:this.teacherId, student_id:this.studentId, subject:this.subject, start_time:`${this.dateValue} ${this.startTime}:00`, end_time:`${this.dateValue} ${this.endTime}:00`, location:this.location, notes:this.notes }); uni.showToast({title:'排课成功！',icon:'success'}); setTimeout(()=>uni.navigateBack(),1000); } catch(e){}
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 60rpx; }
</style>
