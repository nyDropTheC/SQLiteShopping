import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

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
		return <View style={ { flexDirection: 'row' } }>
			<Text style={ { marginRight: '5%' } }>{item.product}, {item.amount}</Text>
			<Text style={ { color: 'red' } } onPress= { ( ) => onDelete ( item.id ) }>Bought</Text>
		</View>
	};

	return (
		<View style={styles.container}>
			<TextInput 
				style={ { borderColor: 'black', borderWidth: 2, width: '50%', marginTop: '25%' } }
				placeholder='Product'
				onChangeText={ text => setProduct ( text ) }
				value={ product }
			/>

			<TextInput 
				style={ { borderColor: 'black', borderWidth: 2, width: '50%', marginTop: '5%' } }
				placeholder='Amount'
				onChangeText={ text => setAmount ( text ) }
				value={ amount }
			/>

			<Button title='Save' onPress= { ( ) => onAdd ( ) }/>

			<FlatList
				keyExtractor={ keyExtractor }
				renderItem={ renderItem }
				data={ present }
			/>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
