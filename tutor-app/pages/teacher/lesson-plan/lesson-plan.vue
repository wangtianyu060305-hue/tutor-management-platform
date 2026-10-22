<template>
  <view class="container">
    <!-- 输入区 -->
    <view v-if="!planGenerated">
      <view class="card flex-between">
        <view>
          <text class="text-lg text-bold" style="display:block;margin-bottom:8rpx;">🤖 AI 自动备课</text>
          <text class="text-sm text-gray">告诉 AI 学生的情况，一键生成个性化教案</text>
        </view>
        <text class="tag tag-blue" @click="goToQuestionBank">📚 题库</text>
      </view>
      <view class="card mt-24">
        <view class="form-group">
          <text class="form-label">选择学生 *</text>
          <picker :range="studentOptions" range-key="name" @change="onStudentChange">
            <view class="form-picker">{{ studentOptions[studentIndex] ? studentOptions[studentIndex].name + ' (' + studentOptions[studentIndex].grade + ')' : '请选择学生' }}</view>
          </picker>
        </view>
        <view class="form-group">
          <text class="form-label">备课科目 *</text>
          <picker :range="subjectOptions" @change="onSubjectChange" :value="subjectIndex">
            <view class="form-picker">{{ subjectOptions[subjectIndex] || '请选择科目' }}</view>
          </picker>
        </view>
        <view class="form-group">
          <text class="form-label">课时长（分钟）</text>
          <picker :range="durationOptions" @change="onDurationChange" :value="durationIndex">
            <view class="form-picker">{{ durationOptions[durationIndex] }} 分钟</view>
          </picker>
        </view>
        <view class="form-group">
          <text class="form-label">教学目标（选填）</text>
          <input class="form-input" v-model="goals" placeholder="如：掌握二次函数图像画法、能够独立完成..." />
        </view>
        <view class="form-group">
          <text class="form-label">学生问题/薄弱点 *</text>
          <textarea class="form-textarea" v-model="problems" :placeholder="placeholderText" maxlength="500" />
          <text class="text-sm text-gray" style="text-align:right;display:block;margin-top:8rpx;">{{ (problems || '').length }}/500</text>
        </view>
        <view class="quick-presets">
          <text class="text-sm text-gray mb-12" style="display:block;">快捷标签（点击添加）：</text>
          <view class="flex-row flex-wrap">
            <text class="preset-tag" v-for="tag in presetTags" :key="tag" @click="addTag(tag)">{{ tag }}</text>
          </view>
        </view>
        <view class="btn-primary mt-24" @click="generatePlan" :disabled="generating">
          {{ generating ? '🤖 AI 正在生成教案...' : '🤖 开始生成教案' }}
        </view>
      </view>
    </view>

    <!-- 教案结果 -->
    <view v-if="planGenerated">
      <view class="flex-between mb-24">
        <text class="btn-outline btn-sm" @click="resetPlan">◀ 重新生成</text>
        <text class="btn-primary btn-sm" @click="useForSchedule">📅 用于排课</text>
      </view>

      <view class="card" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;">
        <text class="text-lg text-bold" style="display:block;">{{ plan.title }}</text>
        <view class="flex-row mt-12 text-sm" style="opacity:0.9;">
          <text>👨‍🎓 {{ studentName }}</text><text class="ml-12">📖 {{ subject }}</text><text class="ml-12">⏱️ {{ duration }} 分钟</text>
        </view>
      </view>

      <view class="card mt-24">
        <text class="text-bold mb-12" style="font-size:30rpx;">🎯 教学目标</text>
        <view v-for="(obj, idx) in plan.teachingObjectives" :key="obj" class="obj-item">
          <text class="obj-num">{{ idx + 1 }}</text><text>{{ obj }}</text>
        </view>
      </view>

      <view class="flex-row mt-24">
        <view class="card flex-1 mr-12">
          <text class="text-bold mb-12" style="font-size:28rpx;color:#22C55E;">✅ 重点</text>
          <text v-for="k in plan.keyPoints" :key="k" class="text-sm" style="display:block;padding:6rpx 0;">• {{ k }}</text>
        </view>
        <view class="card flex-1">
          <text class="text-bold mb-12" style="font-size:28rpx;color:#EF4444;">⚠️ 难点</text>
          <text v-for="d in plan.difficultPoints" :key="d" class="text-sm" style="display:block;padding:6rpx 0;">• {{ d }}</text>
        </view>
      </view>

      <view class="card mt-24">
        <text class="text-bold mb-24" style="font-size:30rpx;">📋 教学流程</text>
        <view v-for="s in plan.steps" :key="s.phase" class="step-item">
          <view class="step-header">
            <text class="step-phase">{{ s.phase }}</text><text class="step-duration">⏱ {{ s.duration }}分钟</text>
          </view>
          <text class="step-content">{{ s.content }}</text>
          <view v-if="s.tips" class="step-tips"><text>💡 {{ s.tips }}</text></view>
        </view>
      </view>

      <view class="card mt-24">
        <view class="flex-between mb-24">
          <text class="text-bold" style="font-size:30rpx;">✏️ 课堂练习</text>
          <text v-if="plan.exercises && plan.exercises[0] && plan.exercises[0].fromBank" class="tag tag-green" style="font-size:22rpx;">📚 来自题库</text>
        </view>
        <view v-for="(ex, idx) in plan.exercises" :key="ex.question" class="exercise-item">
          <text class="text-bold" style="font-size:26rpx;">题{{ idx + 1 }}：{{ ex.question }}</text>
          <view class="exercise-answer mt-12"><text class="text-sm text-gray">参考答案：{{ ex.answer }}</text></view>
          <view class="flex-row mt-8 flex-wrap">
            <text class="tag tag-purple">{{ ex.purpose }}</text>
            <text v-if="ex.fromBank && ex.source === 'teacher'" class="tag tag-orange ml-8">🔒 我的题库</text>
            <text v-else-if="ex.fromBank" class="tag tag-green ml-8">📚 系统题库</text>
          </view>
        </view>
      </view>

      <view class="card mt-24">
        <text class="text-bold mb-12" style="font-size:30rpx;">📝 课堂总结</text>
        <text class="text-sm" style="line-height:1.8;color:#4B5563;">{{ plan.summary }}</text>
      </view>
      <view class="card mt-24">
        <text class="text-bold mb-12" style="font-size:30rpx;">📚 课后作业</text>
        <text class="text-sm" style="line-height:1.8;color:#4B5563;white-space:pre-line;">{{ plan.homework }}</text>
      </view>
      <view class="card mt-24">
        <text class="text-bold mb-12" style="font-size:30rpx;">🔮 下节课预告</text>
        <text class="text-sm" style="line-height:1.8;color:#4B5563;">{{ plan.nextPreview }}</text>
      </view>

      <view class="flex-row mt-24 mb-24">
        <view class="btn-outline flex-1 mr-12" @click="resetPlan">重新生成</view>
        <view class="btn-primary flex-1" @click="useForSchedule">📅 用此教案排课</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStudents, generateLessonPlan } from '../../../utils/api';

export default {
  data() {
    return {
      planGenerated: false, generating: false,
      studentOptions: [], studentIndex: 0, selectedStudent: null, studentName: '',
      subjectOptions: ['数学','英语','语文','物理','化学','生物','历史','地理','政治'],
      subjectIndex: 0, subject: '数学',
      durationOptions: [60,90,120,150,180], durationIndex: 2, duration: 120,
      goals: '', problems: '',
      presetTags: ['基础薄弱，跟不上进度','计算容易出错','概念理解不透彻','公式记不住，记混','不会灵活运用','做题速度太慢','审题不仔细，粗心','应用题看不懂','考前突击','缺乏解题思路','对学习没兴趣','需要拔高拓展','作业完成质量差','知识点断层严重','记忆方法需要改善'],
      plan: {},
      placeholderText: '详细描述学生的问题，AI 会根据这些信息生成针对性教案...\n\n例如：\n• 一元二次方程公式法掌握了，但配方法总出错\n• 二次函数图像的平移变换搞不清楚\n• 遇到综合题不知道从哪里下手\n• 计算时经常犯低级错误\n\n描述越具体，生成的教案越精准！'
    };
  },
  mounted() { this.loadStudents(); },
  methods: {
    async loadStudents() {
      try {
        const res = await getStudents();
        this.studentOptions = (res.students || []).map(s => ({
          ...s, subjects: typeof s.subjects === 'string' ? JSON.parse(s.subjects) : (s.subjects || [])
        }));
      } catch (e) {}
    },
    goToQuestionBank() { uni.navigateTo({ url: '/pages/teacher/question-bank/question-bank' }); },
    onStudentChange(e) {
      const idx = parseInt(e.detail.value);
      const student = this.studentOptions[idx];
      if (!student) return;
      this.studentIndex = idx; this.selectedStudent = student; this.studentName = student.name;
      if (student.subjects && student.subjects.length > 0) {
        const si = this.subjectOptions.indexOf(student.subjects[0]);
        if (si >= 0) { this.subjectIndex = si; this.subject = this.subjectOptions[si]; }
      }
      if (student.notes && !this.problems) this.problems = student.notes;
    },
    onSubjectChange(e) { const idx = parseInt(e.detail.value); this.subjectIndex = idx; this.subject = this.subjectOptions[idx]; },
    onDurationChange(e) { const idx = parseInt(e.detail.value); this.durationIndex = idx; this.duration = this.durationOptions[idx]; },
    addTag(tag) { if (!(this.problems || '').includes(tag)) this.problems = this.problems ? this.problems + '；' + tag : tag; },
    async generatePlan() {
      if (!this.studentName) { uni.showToast({ title: '请选择学生', icon: 'none' }); return; }
      if (!this.problems) { uni.showToast({ title: '请描述学生的问题', icon: 'none' }); return; }
      this.generating = true;
      try {
        const result = await generateLessonPlan({
          studentName: this.studentName, grade: this.selectedStudent ? this.selectedStudent.grade : '',
          subject: this.subject, problems: this.problems, goals: this.goals, duration: this.duration, previousCourses: []
        });
        this.plan = result; this.planGenerated = true; this.generating = false;
        uni.showToast({ title: '教案生成成功！', icon: 'success' });
        uni.pageScrollTo({ scrollTop: 0 });
      } catch (e) { this.generating = false; uni.showToast({ title: '生成失败', icon: 'none' }); }
    },
    resetPlan() {
      uni.showModal({ title: '确认重置', content: '重新生成会清除当前教案，确定吗？', success: (res) => { if (res.confirm) { this.planGenerated = false; this.plan = {}; } } });
    },
    useForSchedule() {
      const studentId = this.selectedStudent ? this.selectedStudent.id : '';
      uni.showActionSheet({
        itemList: ['新建排课（使用此教案）', '复制教案内容'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.navigateTo({ url: `/pages/schedule/create/create?studentId=${studentId}&subject=${encodeURIComponent(this.subject)}` });
          } else if (res.tapIndex === 1) {
            const text = this.formatPlanAsText();
            uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制', icon: 'success' }) });
          }
        }
      });
    },
    formatPlanAsText() {
      const p = this.plan;
      let text = `📋 ${p.title}\n\n👨‍🎓 ${this.studentName} | 📖 ${this.subject} | ⏱️ ${this.duration}分钟\n\n🎯 教学目标：\n`;
      (p.teachingObjectives || []).forEach((o,i) => text += `  ${i+1}. ${o}\n`);
      text += `\n📋 教学流程：\n`;
      (p.steps || []).forEach(s => text += `  ${s.phase} (${s.duration}min): ${s.content}\n`);
      text += `\n📚 课后作业：\n${p.homework || ''}\n`;
      return text;
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 60rpx; }
.quick-presets {}
.preset-tag { display: inline-block; padding: 10rpx 20rpx; background: #F3F4F6; border: 2rpx solid #E5E7EB; border-radius: 20rpx; font-size: 24rpx; color: #6B7280; margin-right: 12rpx; margin-bottom: 10rpx; }
.preset-tag:active { background: #4F46E5; color: #FFF; border-color: #4F46E5; }
.obj-item { display: flex; align-items: flex-start; padding: 12rpx 0; border-bottom: 1rpx solid #F3F4F6; }
.obj-item:last-child { border-bottom: none; }
.obj-num { width: 40rpx; height: 40rpx; border-radius: 50%; background: #4F46E5; color: #FFF; font-size: 22rpx; display: flex; align-items: center; justify-content: center; margin-right: 16rpx; flex-shrink: 0; }
.step-item { padding: 20rpx 0; border-bottom: 1rpx solid #F3F4F6; }
.step-item:last-child { border-bottom: none; }
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.step-phase { font-size: 28rpx; font-weight: 700; color: #1F2937; }
.step-duration { font-size: 24rpx; color: #8B5CF6; background: #F5F3FF; padding: 4rpx 12rpx; border-radius: 6rpx; }
.step-content { display: block; font-size: 26rpx; color: #4B5563; line-height: 1.7; }
.step-tips { margin-top: 10rpx; padding: 12rpx; background: #FFFBEB; border-radius: 8rpx; font-size: 24rpx; color: #D97706; }
.exercise-item { padding: 20rpx; background: #F9FAFB; border-radius: 12rpx; margin-bottom: 16rpx; border-left: 4rpx solid #8B5CF6; }
.exercise-item:last-child { margin-bottom: 0; }
.exercise-answer { padding: 12rpx; background: #F0FDF4; border-radius: 8rpx; }
</style>
