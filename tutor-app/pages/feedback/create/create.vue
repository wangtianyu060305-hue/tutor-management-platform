<template>
  <view class="container">
    <text class="text-lg text-bold mb-24">{{ editingId ? '编辑反馈' : '写反馈' }}</text>
    <view class="card">
      <view class="form-group"><text class="form-label">学生 *</text><picker :range="studentOptions" range-key="name" @change="onStudentChange"><view class="form-picker">{{ studentOptions[studentIndex] ? studentOptions[studentIndex].name : '请选择学生' }}</view></picker></view>
      <view class="form-group"><text class="form-label">关联课程</text><picker :range="courseOptions" range-key="label" @change="onCourseChange"><view class="form-picker">{{ courseOptions[courseIndex] ? courseOptions[courseIndex].label : '不关联' }}</view></picker></view>
      <view class="form-group"><text class="form-label">标题 *</text><input class="form-input" v-model="title" placeholder="如：小明数学课后反馈" /></view>
      <view class="form-group"><text class="form-label">类型</text><picker :range="['after_class','weekly','monthly']" @change="onTypeChange"><view class="form-picker">{{ type==='after_class'?'课后反馈':type==='weekly'?'周报':'月报' }}</view></picker></view>
      <view class="form-group"><text class="form-label">评分</text><view class="flex-row"><text v-for="i in 5" :key="i" style="font-size:40rpx;padding:4rpx;opacity:0.3" :style="{opacity:rating>=i?1:0.3}" @click="rating=i">⭐</text></view></view>
      <view class="form-group"><text class="form-label">反馈内容 *</text><textarea class="form-textarea" v-model="content" placeholder="详细描述学生的课堂表现..." maxlength="1000" /></view>
      <view class="form-group"><text class="form-label">表现亮点</text><input class="form-input" v-model="highlights" placeholder="学生做得好的地方" /></view>
      <view class="form-group"><text class="form-label">需要加强</text><input class="form-input" v-model="areasToImprove" placeholder="需要改进的地方" /></view>
      <view class="form-group"><text class="form-label">课后作业</text><input class="form-input" v-model="homework" placeholder="布置的作业" /></view>
      <view class="btn-primary mt-24" @click="submit">提交反馈</view>
    </view>
  </view>
</template>
<script>
import { getStudents, getCourses, createFeedback } from '../../../utils/api';
export default { data(){return{studentOptions:[],studentIndex:0,studentId:null,courseOptions:[],courseIndex:0,courseId:null,title:'',type:'after_class',rating:5,content:'',highlights:'',areasToImprove:'',homework:''}}, mounted(){this.loadOptions()}, onLoad(o){if(o&&o.studentId)this.studentId=parseInt(o.studentId);if(o&&o.courseId)this.courseId=parseInt(o.courseId);if(o&&o.studentName)this.title=`${o.studentName}课后反馈`}, methods:{async loadOptions(){try{const[s,c]=await Promise.all([getStudents(),getCourses()]);this.studentOptions=s.students||[];this.courseOptions=(c.courses||[]).map(c=>({id:c.id,label:`${c.subject}(${c.student_name})`}));if(this.studentId)this.studentIndex=this.studentOptions.findIndex(s=>s.id===this.studentId);if(this.courseId)this.courseIndex=this.courseOptions.findIndex(c=>c.id===this.courseId)}catch(e){}},onStudentChange(e){this.studentIndex=parseInt(e.detail.value);this.studentId=this.studentOptions[this.studentIndex]?this.studentOptions[this.studentIndex].id:null},onCourseChange(e){this.courseIndex=parseInt(e.detail.value);this.courseId=this.courseOptions[this.courseIndex]?this.courseOptions[this.courseIndex].id:null},onTypeChange(e){this.type=['after_class','weekly','monthly'][e.detail.value]},async submit(){if(!this.studentId){uni.showToast({title:'请选择学生',icon:'none'});return}if(!this.title||!this.content){uni.showToast({title:'标题和内容不能为空',icon:'none'});return}try{await createFeedback({student_id:this.studentId,course_id:this.courseId,title:this.title,content:this.content,highlights:this.highlights,areas_to_improve:this.areasToImprove,homework:this.homework,rating:this.rating,type:this.type});uni.showToast({title:'反馈已提交',icon:'success'});setTimeout(()=>uni.navigateBack(),1000)}catch(e){}}}};
</script>
<style scoped>.container{padding-bottom:60rpx}</style>
