<template>
  <view class="container">
    <view class="tab-bar">
      <view :class="'tab-item ' + (tab==='list'?'active':'')" @click="tab='list'">📚 我的题库</view>
      <view :class="'tab-item ' + (tab==='add'?'active':'')" @click="tab='add'">{{ editingId ? '✏️ 编辑' : '➕ 添加' }}</view>
    </view>

    <view v-if="tab==='list'">
      <view class="flex-row mt-16">
        <picker :range="subjectOptions" @change="onFilterSubject"><view class="filter-btn">{{ filterSubject || '科目' }}</view></picker>
        <picker :range="gradeOptions" @change="onFilterGrade"><view class="filter-btn ml-12">{{ filterGrade || '年级' }}</view></picker>
        <text v-if="filterSubject || filterGrade" class="ml-12" style="color:#4F46E5;line-height:56rpx;" @click="clearFilter">清除</text>
      </view>

      <view v-if="questions.length > 0" class="mt-16">
        <view class="q-card" v-for="q in questions" :key="q.id">
          <view class="flex-between mb-8">
            <text class="tag tag-purple">{{ q.subject }} · {{ q.grade }}</text>
            <text class="tag tag-blue">{{ q.topic || '未分类' }}</text>
          </view>
          <text class="text-bold" style="display:block;font-size:28rpx;line-height:1.6;">{{ q.question }}</text>
          <view class="answer-box mt-12"><text class="text-sm text-gray">答案：{{ q.answer }}</text></view>
          <view class="flex-between mt-12">
            <view class="flex-row">
              <text class="tag tag-orange">难度：{{ '⭐'.repeat(q.difficulty) }}</text>
              <text class="tag tag-green ml-8">🔒 私有</text>
            </view>
            <view class="flex-row">
              <text class="btn-text" @click="editQuestion(q)">编辑</text>
              <text class="btn-text ml-16" style="color:#EF4444;" @click="deleteQuestion(q)">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-box mt-24"><text>📭</text><text class="text-sm text-gray mt-12" style="display:block;">还没有私有题目</text></view>
    </view>

    <view v-if="tab==='add'">
      <view class="card">
        <text class="text-bold" style="font-size:30rpx;">{{ editingId ? '编辑题目' : '添加新题目' }}</text>

        <view class="flex-row mt-16">
          <view class="form-group flex-1 mr-12">
            <text class="form-label">科目 *</text>
            <picker :range="subjectOptions" @change="onFormPicker('subject',$event)"><view class="form-picker">{{ form.subject || '请选择' }}</view></picker>
          </view>
          <view class="form-group flex-1">
            <text class="form-label">年级 *</text>
            <picker :range="gradeOptions" @change="onFormPicker('grade',$event)"><view class="form-picker">{{ form.grade || '请选择' }}</view></picker>
          </view>
        </view>

        <view class="flex-row mt-16">
          <view class="form-group flex-1 mr-12">
            <text class="form-label">知识点</text>
            <input class="form-input" v-model="form.topic" placeholder="如：二次函数" />
          </view>
          <view class="form-group flex-1">
            <text class="form-label">题型</text>
            <picker :range="typeOptions" range-key="label" @change="onFormPicker('question_type',$event)"><view class="form-picker">{{ getTypeLabel() }}</view></picker>
          </view>
        </view>

        <view class="form-group mt-16">
          <text class="form-label">难度</text>
          <view class="flex-row mt-8">
            <text v-for="l in 5" :key="l" :class="'diff-star ' + (form.difficulty >= l ? 'active' : '')" @click="form.difficulty=l">⭐</text>
          </view>
        </view>

        <view class="form-group mt-16">
          <text class="form-label">题目内容 *</text>
          <textarea class="form-textarea" v-model="form.question" placeholder="请输入题目完整内容..." maxlength="2000" />
        </view>

        <view class="form-group mt-16">
          <text class="form-label">参考答案 *</text>
          <textarea class="form-textarea" v-model="form.answer" placeholder="请输入参考答案或解析..." maxlength="2000" />
        </view>

        <view class="form-group mt-16">
          <text class="form-label">标签（逗号分隔）</text>
          <input class="form-input" v-model="form.tags" placeholder="如：计算,基础,方程" />
        </view>

        <view class="flex-row mt-24">
          <view class="btn-outline flex-1 mr-12" @click="resetForm">{{ editingId ? '取消' : '重置' }}</view>
          <view class="btn-primary flex-1" @click="submitForm">{{ editingId ? '💾 保存修改' : '📥 添加到我的题库' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../../utils/api';

export default {
  data() {
    return {
      tab: 'list', questions: [], total: 0, loading: false, editingId: null,
      filterSubject: '', filterGrade: '',
      subjectOptions: ['数学','英语','语文','物理','化学','生物','历史','地理','政治'],
      gradeOptions: ['一年级','二年级','三年级','四年级','五年级','六年级','初一','初二','初三','高一','高二','高三'],
      typeOptions: [{value:'calculation',label:'计算题'},{value:'choice',label:'选择题'},{value:'fill',label:'填空题'},{value:'proof',label:'证明题'},{value:'application',label:'应用题'},{value:'reading',label:'阅读题'},{value:'writing',label:'写作题'},{value:'grammar',label:'语法题'},{value:'other',label:'其他'}],
      form: { subject:'', grade:'', topic:'', question_type:'calculation', difficulty:3, question:'', answer:'', tags:'' }
    };
  },
  mounted() { this.loadQuestions(); },
  methods: {
    async loadQuestions() {
      this.loading = true;
      try {
        const res = await getMyQuestions({ subject: this.filterSubject, grade: this.filterGrade, page: 1, limit: 50 });
        this.questions = res.questions; this.total = res.total;
      } catch (e) {}
      this.loading = false;
    },
    onFilterSubject(e) { this.filterSubject = this.subjectOptions[e.detail.value]; this.loadQuestions(); },
    onFilterGrade(e) { this.filterGrade = this.gradeOptions[e.detail.value]; this.loadQuestions(); },
    clearFilter() { this.filterSubject = ''; this.filterGrade = ''; this.loadQuestions(); },
    getTypeLabel() { const t = this.typeOptions.find(t => t.value === this.form.question_type); return t ? t.label : '计算题'; },
    onFormPicker(field, e) {
      if (field === 'question_type') this.form.question_type = this.typeOptions[e.detail.value].value;
      else if (field === 'subject') this.form.subject = this.subjectOptions[e.detail.value];
      else this.form.grade = this.gradeOptions[e.detail.value];
    },
    editQuestion(q) {
      this.tab = 'add'; this.editingId = q.id;
      this.form = { subject: q.subject, grade: q.grade, topic: q.topic || '', question_type: q.question_type, difficulty: q.difficulty, question: q.question, answer: q.answer, tags: q.tags || '' };
    },
    async submitForm() {
      if (!this.form.subject || !this.form.grade || !this.form.question || !this.form.answer) { uni.showToast({ title: '请填写必填项', icon: 'none' }); return; }
      try {
        if (this.editingId) { await updateQuestion(this.editingId, this.form); } else { await addQuestion(this.form); }
        uni.showToast({ title: this.editingId ? '已更新' : '已添加', icon: 'success' });
        this.resetForm(); this.loadQuestions();
      } catch (e) {}
    },
    resetForm() {
      this.editingId = null;
      this.form = { subject:'', grade:'', topic:'', question_type:'calculation', difficulty:3, question:'', answer:'', tags:'' };
    },
    deleteQuestion(q) {
      uni.showModal({ title: '确认删除', content: '删除后不可恢复，确定吗？', success: async (res) => {
        if (!res.confirm) return;
        try { await deleteQuestion(q.id); uni.showToast({ title: '已删除', icon: 'success' }); this.loadQuestions(); } catch(e){}
      }});
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 60rpx; }
.tab-bar { display: flex; background: #FFF; border-radius: 12rpx; overflow: hidden; margin-bottom: 20rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.tab-item { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; font-weight: 600; color: #6B7280; border-bottom: 4rpx solid transparent; }
.tab-item.active { color: #4F46E5; border-bottom-color: #4F46E5; }
.filter-btn { padding: 12rpx 24rpx; background: #FFF; border: 2rpx solid #E5E7EB; border-radius: 8rpx; font-size: 26rpx; color: #4B5563; }
.q-card { background: #FFF; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.answer-box { background: #F0FDF4; padding: 16rpx; border-radius: 8rpx; }
.btn-text { font-size: 26rpx; color: #4F46E5; padding: 4rpx 0; }
.diff-star { font-size: 40rpx; padding: 8rpx; opacity: 0.3; }
.diff-star.active { opacity: 1; }
</style>
