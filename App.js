import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Header, Icon, Input, ListItem } from '@rneui/themed';
import * as SQLite from 'expo-sqlite';

export default function App() {
	const [ product, setProduct ] = React.useState ( '' );
	const [ amount, setAmount ] = React.useState ( '' );
	const [ present, setPresent ] = React.useState ( [ ] );

	const database = SQLite.openDatabase ( 'shoppinglist.db' );

	const updatePresent = ( ) => {
		database.transaction ( context => {
			context.executeSql ( 'SELECT * FROM ShoppingItems;', [ ], ( _, { rows } ) => {
				setPresent ( rows._array );
			} );
		}, null, null );
	};

	React.useEffect ( ( ) => {
		database.transaction ( context => {
			context.executeSql ( 'CREATE TABLE IF NOT EXISTS ShoppingItems (id INTEGER PRIMARY KEY NOT NULL, product TEXT NOT NULL, amount TEXT NOT NULL);' );
		}, null, updatePresent );
	}, [ ] );

	const onAdd = ( ) => {
		database.transaction ( context => {
			context.executeSql ( 'INSERT INTO ShoppingItems (product, amount) values (?, ?);', [ product, amount ] );
		}, null, updatePresent );
	};

	const onDelete = ( id ) => {
		database.transaction ( context => {
			context.executeSql ( 'DELETE FROM ShoppingItems WHERE id = ?;', [ id ] );
		}, null, updatePresent );
	};

	const keyExtractor = i => i.id.toString ( );

	const renderItem = ( { item } ) => {
		return <ListItem bottomDivider>
			<ListItem.Content>
				<ListItem.Title>{ item.product }</ListItem.Title>
				<ListItem.Subtitle style={ { color: '#C8C8C8' } }>{ item.amount }</ListItem.Subtitle>
			</ListItem.Content>
			<ListItem.Content right>
				<Button raised color='error' type='clear' onPress={ ( ) => onDelete ( item.id ) } icon={ { name: 'delete', color: 'red' } }/>
			</ListItem.Content>
		</ListItem>
	};

	return (
		<View style={styles.container}>
			<Header
				centerComponent={ { text: 'Shopping List', style: { color: 'white' } } }
			/>
			<Input 
				style={ { width: '50%', marginTop: 'auto' } }
				label='Product'
				placeholder='Product'
				onChangeText={ text => setProduct ( text ) }
				value={ product }
			/>

			<Input 
				style={ { width: '50%', marginTop: 'auto' } }
				label='Amount'
				placeholder='Amount'
				onChangeText={ text => setAmount ( text ) }
				value={ amount }
			/>

			<Button title='Save' onPress= { ( ) => onAdd ( ) } raised icon={ { name: 'save' } }/>
			
			<FlatList
				keyExtractor={ keyExtractor }
				renderItem={ renderItem }
				data={ present }
				style={ { marginTop: '5%' } }
			/>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
});
