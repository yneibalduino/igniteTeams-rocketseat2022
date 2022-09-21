import { FlatList, Alert, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Filter } from "@components/FilterBorder";
import { PlayerCard } from "@components/PlayerCards";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from '@components/Button';
import { AppError } from '@utils/AppError';
import { playerAddByGroup } from '@storage/players/playerAddByGroup';
import { playersGetByGroupAndTeam } from '@storage/players/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/players/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/players/playerRemoveByGroup';
import { groupRemoveByName } from '../../storage/group/groupRemoveByName';

type RouteParams = {
  group: string;
}

export function Players(){
  const navigation = useNavigation();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [team, setTeam] = useState('Time A');
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
  const route = useRoute();
  const { group } = route.params as RouteParams;

  async function handleAddPlayer(){
    if(newPlayerName.trim().length === 0){
      return Alert.alert('Nova pessoa', 'Informe o nome da pessoa para adicionar.')
    }

    const newPlayer = {
      name: newPlayerName,
      team,
    }

    try {
      await playerAddByGroup(newPlayer, group);
      setNewPlayerName('');
      fetchPayersByTeam();

      Keyboard.dismiss();

    } catch (error) {

      if(error instanceof AppError){
        Alert.alert('Nova pessoa', error.message);

      }else{
        console.log(error);
        Alert.alert('Nova pessoa', 'Não foi possível adicionar.');

      }
    }
  }

  async function fetchPayersByTeam(){

    try{
      const playersByTeam = await playersGetByGroupAndTeam(group,team);
      setPlayers(playersByTeam);
    } catch(error){
      console.log(error);
      Alert.alert('Não foi possivel carregar as pessoas do time selecionado.');
    }

  }
 
  async function handleRemovePlayer(playerName: string){
    try{
      await playerRemoveByGroup(playerName, group);
      fetchPayersByTeam();

    } catch(error){
      Alert.alert('Remover pessoa', 'Não foi possível remover esta pessoa.')
    }
  }

  async function groupRemove(){

    try{

      await groupRemoveByName(group);
      navigation.navigate('groups')


    } catch(error){
      Alert.alert('Remover grupo', 'Não foi possível remover o grupo.')
    }
  }

  async function handleGroupRemove(){
    Alert.alert('Remover', 'Deseja remover o grupo?',[
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => groupRemove()
      }
    ]);
  }

  useEffect(() => {
    fetchPayersByTeam()
  }, [team])

  return(
    <Container>

      <Header showBackButton/>

      <Highlight 
        title={group}
        subtitle="Adicione a galera e separe os times."
      />

      <Form>
        <Input
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          placeholder={"Nome da pessoa"}
          autoCorrect={false}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />
        <ButtonIcon 
          icon='add'
          onPress={handleAddPlayer}
        />
      </Form>
      
      <HeaderList>
        <FlatList 
          data={['Time A', 'Time B']}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Filter 
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />

        <NumberOfPlayers>
          {players.length}
        </NumberOfPlayers>

      </HeaderList>
      <FlatList 
        data={players}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <PlayerCard 
            name={item.name}
            onRemove={() => handleRemovePlayer(item.name)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmpty 
            message="Adicione a primeira turma."
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {paddingBottom: 100},
          players.length === 0 && {flex: 1}
        ]}
      />

      <Button 
        title="Remover turma"
        type='SECONDARY'
        onPress={handleGroupRemove}
      />

    </Container>
  )
}