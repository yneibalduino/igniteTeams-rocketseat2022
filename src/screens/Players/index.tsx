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
import { Loading } from '@components/Loading';

type RouteParams = {
  group: string;
}

export function Players(){
  const [isLoading, setIsLoading] = useState(true);
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
        Alert.alert('Nova pessoa', 'N??o foi poss??vel adicionar.');

      }
    }
  }

  async function fetchPayersByTeam(){

    try{
      setIsLoading(true);
      const playersByTeam = await playersGetByGroupAndTeam(group,team);
      setPlayers(playersByTeam);
      setIsLoading(false);
    } catch(error){
      console.log(error);
      Alert.alert('N??o foi possivel carregar as pessoas do time selecionado.');
    }

  }
 
  async function handleRemovePlayer(playerName: string){
    try{
      await playerRemoveByGroup(playerName, group);
      fetchPayersByTeam();

    } catch(error){
      Alert.alert('Remover pessoa', 'N??o foi poss??vel remover esta pessoa.')
    }
  }

  async function groupRemove(){

    try{

      await groupRemoveByName(group);
      navigation.navigate('groups')


    } catch(error){
      Alert.alert('Remover grupo', 'N??o foi poss??vel remover o grupo.')
    }
  }

  async function handleGroupRemove(){
    Alert.alert('Remover', 'Deseja remover o grupo?',[
      {
        text: 'N??o',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => groupRemove()
      }
    ]);
  }

  useEffect(() => {
    fetchPayersByTeam();
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

      {
          isLoading ? <Loading /> :

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
    }

      <Button 
        title="Remover turma"
        type='SECONDARY'
        onPress={handleGroupRemove}
      />

    </Container>
  )
}