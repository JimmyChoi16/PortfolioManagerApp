<template>
  <div>
    <h2>Create Portfolio</h2>
    <el-form :model="form" @submit.prevent="onSubmit">
      <el-form-item label="Portfolio Name">
        <el-input v-model="form.name" required />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item label="Select Holdings">
        <el-checkbox-group v-model="form.selectedHoldings">
          <el-checkbox
            v-for="h in holdings"
            :key="h.id"
            :label="h.id"
          >{{ h.symbol }} - {{ h.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <div v-for="id in form.selectedHoldings" :key="id">
        <span>Allocation (%) : </span>
        <el-input-number v-model="form.allocation[id]" :min="0" :max="100" />
      </div>
      <el-button type="primary" @click="onSubmit">Create</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import portfolioAPI from '../api/portfolio';
// Props: holdings (array of holding objects)
const props = defineProps({ holdings: Array });
const emit = defineEmits(['portfolio-created'])
const form = ref({
  name: '',
  description: '',
  selectedHoldings: [],
  allocation: {}
});

const onSubmit = async () => {
  // Get userName from localStorage
  const userName = localStorage.getItem('userName') || '';
  // Prepare holdings array for API
  const holdings = form.value.selectedHoldings.map(id => ({
    holding_id: id,
    allocation_percent: form.value.allocation[id] || 0
  }));
  await portfolioAPI.createPortfolio({
    user_name: userName,
    name: form.value.name,
    description: form.value.description,
    holdings
  });
  // Emit event to parent component
  emit('portfolio-created')
  // Reset form
  form.value = {
    name: '',
    description: '',
    selectedHoldings: [],
    allocation: {}
  }
};
</script> 