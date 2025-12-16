import axiosInstance from './axiosConfig';
import ModelDTO from './DTO/model.dto';
import ModelTrainingDTO from './DTO/modelTraining.dto';

export const fetchModels = async (): Promise<ModelDTO[]> => {
  try {
    const response = await axiosInstance.get('/models');
    return response.data; 
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const scanForNewModels = async (): Promise<void> => {
  try {
      await axiosInstance.post('/models/scan');   
    } catch (error) {   
      console.error('Error scanning for new models:', error);
      throw error;
    }
};

export const setActiveModel = async (model: ModelDTO): Promise<void> => {
  try {
    await axiosInstance.post('/models', model);
  } catch (error) {
    console.error('Error setting active model:', error);
    throw error;
  }
};

export const trainModel = async (trainingData: ModelTrainingDTO): Promise<void> => {
    try {
        await axiosInstance.post('/models/train', trainingData);
    } catch (error) {
        console.error('Error training model:', error);
        throw error;
    }
}
