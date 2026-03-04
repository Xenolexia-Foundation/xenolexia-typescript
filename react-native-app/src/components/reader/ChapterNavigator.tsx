/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Chapter Navigator - Table of contents navigation
 */

import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable} from 'react-native';

import {useReaderStore} from '@stores/readerStore';

interface ChapterNavigatorProps {
  visible: boolean;
  onClose: () => void;
  bookId: string;
}

export function ChapterNavigator({
  visible,
  onClose,
  bookId,
}: ChapterNavigatorProps): React.JSX.Element {
  const {chapters, currentChapterIndex, goToChapter} = useReaderStore();

  const handleChapterSelect = (index: number) => {
    goToChapter(index);
    onClose();
  };

  const renderChapter = ({item, index}: {item: any; index: number}) => {
    const isCurrentChapter = index === currentChapterIndex;

    return (
      <TouchableOpacity
        style={[styles.chapterItem, isCurrentChapter && styles.chapterItemCurrent]}
        onPress={() => handleChapterSelect(index)}
      >
        <View style={styles.chapterNumber}>
          <Text style={[styles.chapterNumberText, isCurrentChapter && styles.currentText]}>
            {index + 1}
          </Text>
        </View>
        <Text
          style={[styles.chapterTitle, isCurrentChapter && styles.currentText]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {isCurrentChapter && <Text style={styles.currentIndicator}>▸</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          <Text style={styles.title}>Chapters</Text>

          {chapters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chapters available</Text>
            </View>
          ) : (
            <FlatList
              data={chapters}
              renderItem={renderChapter}
              keyExtractor={(item, index) => item.id || index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chapterItem: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  chapterItemCurrent: {
    backgroundColor: '#e0f2fe',
  },
  chapterNumber: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  chapterNumberText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  chapterTitle: {
    color: '#1f2937',
    flex: 1,
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16,
  },
  closeButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  currentIndicator: {
    color: '#0ea5e9',
    fontSize: 16,
    marginLeft: 8,
  },
  currentText: {
    color: '#0369a1',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    height: 4,
    marginBottom: 16,
    marginTop: 12,
    width: 40,
  },
  listContent: {
    paddingBottom: 16,
  },
  title: {
    color: '#1f2937',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
});
