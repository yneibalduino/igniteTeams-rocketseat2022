import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError } from "@utils/AppError";

import { GROUP_COLLECTION } from "@storage/storageConfig";
import { groupsGetAll } from "./groupsGetAll";

export async function groupCreate(newGroup: string){

  try{
    const storageGroups = await groupsGetAll();
    const groupAlreadyExists = storageGroups.includes(newGroup);

    if(groupAlreadyExists){
      throw new AppError('Não é possível utilizar este nome!');
    }
    const storage = JSON.stringify([...storageGroups, newGroup]);

    await AsyncStorage.setItem(GROUP_COLLECTION, storage);

  }catch(error){
    throw error;
  };
}