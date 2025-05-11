
import { ApiResponse } from '@/types/api/apiResponse';
import { 
  PressRelease, 
  PressReleaseForm, 
  PressReleaseQueryParams,
  MediaGroup,
  MediaGroupForm,
  MediaContact,
  MediaContactForm,
  MediaGroupQueryParams,
  MediaContactQueryParams
} from '@/types/pressRelease';

// Funkcja pomocnicza do generowania ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Przykładowe dane
const mockMediaGroups: MediaGroup[] = [
  {
    id: '1',
    name: 'Dziennikarze prasowi',
    description: 'Dziennikarze z gazet codziennych',
    createdAt: new Date(2024, 3, 15).toISOString(),
    updatedAt: new Date(2024, 3, 15).toISOString(),
    createdBy: 'user-1',
    contactCount: 23,
    tags: ['prasa', 'dzienniki']
  },
  {
    id: '2',
    name: 'Telewizje',
    description: 'Przedstawiciele telewizji',
    createdAt: new Date(2024, 3, 10).toISOString(),
    updatedAt: new Date(2024, 4, 5).toISOString(),
    createdBy: 'user-1',
    contactCount: 15,
    tags: ['tv', 'media']
  },
  {
    id: '3',
    name: 'Portale internetowe',
    description: 'Dziennikarze i redaktorzy portali internetowych',
    createdAt: new Date(2024, 2, 20).toISOString(),
    updatedAt: new Date(2024, 2, 20).toISOString(),
    createdBy: 'user-1',
    contactCount: 42,
    tags: ['internet', 'portale']
  }
];

const mockMediaContacts: MediaContact[] = [
  {
    id: '1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'j.kowalski@gazeta.pl',
    phone: '+48 123 456 789',
    mediaOutlet: 'Gazeta Codzienna',
    position: 'Redaktor',
    groups: ['1'],
    tags: ['kultura', 'muzyka'],
    createdAt: new Date(2024, 3, 15).toISOString(),
    updatedAt: new Date(2024, 3, 15).toISOString(),
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna.nowak@tvn.pl',
    phone: '+48 987 654 321',
    mediaOutlet: 'TVN',
    position: 'Reporter',
    groups: ['2'],
    tags: ['kultura', 'film', 'tv'],
    createdAt: new Date(2024, 2, 10).toISOString(),
    updatedAt: new Date(2024, 2, 10).toISOString(),
  },
  {
    id: '3',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    email: 'piotr@portal.com',
    mediaOutlet: 'Portal Kulturalny',
    position: 'Redaktor naczelny',
    groups: ['3'],
    tags: ['wydarzenia', 'kultura', 'teatr'],
    createdAt: new Date(2024, 1, 5).toISOString(),
    updatedAt: new Date(2024, 4, 2).toISOString(),
  }
];

const mockPressReleases: PressRelease[] = [
  {
    id: '1',
    title: 'Otwarcie nowej wystawy w Muzeum Narodowym',
    content: 'Z przyjemnością zapraszamy na otwarcie nowej wystawy w Muzeum Narodowym...',
    status: 'sent',
    type: 'invitation',
    createdAt: new Date(2024, 4, 1).toISOString(),
    updatedAt: new Date(2024, 4, 1).toISOString(),
    scheduledFor: new Date(2024, 4, 5).toISOString(),
    sentAt: new Date(2024, 4, 5).toISOString(),
    createdBy: 'user-1',
    mediaGroups: ['1', '3'],
    metrics: {
      sentCount: 65,
      deliveredCount: 62,
      openCount: 35,
      clickCount: 18,
      responseCount: 5
    }
  },
  {
    id: '2',
    title: 'Konferencja prasowa - Festiwal Filmowy 2024',
    content: 'Zapraszamy na konferencję prasową dotyczącą tegorocznej edycji Festiwalu Filmowego...',
    status: 'scheduled',
    type: 'invitation',
    createdAt: new Date(2024, 4, 5).toISOString(),
    updatedAt: new Date(2024, 4, 5).toISOString(),
    scheduledFor: new Date(2024, 4, 15).toISOString(),
    createdBy: 'user-1',
    mediaGroups: ['1', '2', '3']
  },
  {
    id: '3',
    title: 'Oświadczenie w sprawie zmian w repertuarze',
    content: 'W związku z zaistniałą sytuacją epidemiologiczną, jesteśmy zmuszeni poinformować o zmianach w repertuarze...',
    status: 'draft',
    type: 'statement',
    createdAt: new Date(2024, 4, 10).toISOString(),
    updatedAt: new Date(2024, 4, 10).toISOString(),
    createdBy: 'user-1',
    mediaGroups: ['2', '3']
  }
];

export class MockPressReleaseService {
  // Metody dla komunikatów prasowych
  async getPressReleases(params?: PressReleaseQueryParams): Promise<ApiResponse<PressRelease[]>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    let filteredPressReleases = [...mockPressReleases];
    
    if (params?.status && params.status !== 'all') {
      filteredPressReleases = filteredPressReleases.filter(pr => pr.status === params.status);
    }
    
    if (params?.type && params.type !== 'all') {
      filteredPressReleases = filteredPressReleases.filter(pr => pr.type === params.type);
    }
    
    if (params?.eventId) {
      filteredPressReleases = filteredPressReleases.filter(pr => pr.eventId === params.eventId);
    }
    
    return { data: filteredPressReleases };
  }
  
  async getPressRelease(id: string): Promise<ApiResponse<PressRelease>> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Symulacja opóźnienia
    
    const pressRelease = mockPressReleases.find(pr => pr.id === id);
    
    if (!pressRelease) {
      return { error: { message: 'Komunikat prasowy nie został znaleziony', code: '404' } };
    }
    
    return { data: pressRelease };
  }
  
  async createPressRelease(data: PressReleaseForm): Promise<ApiResponse<PressRelease>> {
    await new Promise(resolve => setTimeout(resolve, 700)); // Symulacja opóźnienia
    
    const newPressRelease: PressRelease = {
      id: generateId(),
      title: data.title,
      content: data.content,
      type: data.type,
      status: 'draft',
      scheduledFor: data.scheduledFor,
      eventId: data.eventId,
      mediaGroups: data.mediaGroups,
      attachmentUrls: data.attachmentUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    };
    
    mockPressReleases.push(newPressRelease);
    
    return { data: newPressRelease };
  }
  
  async updatePressRelease(id: string, data: Partial<PressReleaseForm>): Promise<ApiResponse<PressRelease>> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Symulacja opóźnienia
    
    const pressReleaseIndex = mockPressReleases.findIndex(pr => pr.id === id);
    
    if (pressReleaseIndex === -1) {
      return { error: { message: 'Komunikat prasowy nie został znaleziony', code: '404' } };
    }
    
    const updatedPressRelease = {
      ...mockPressReleases[pressReleaseIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    mockPressReleases[pressReleaseIndex] = updatedPressRelease;
    
    return { data: updatedPressRelease };
  }
  
  async deletePressRelease(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    const pressReleaseIndex = mockPressReleases.findIndex(pr => pr.id === id);
    
    if (pressReleaseIndex === -1) {
      return { error: { message: 'Komunikat prasowy nie został znaleziony', code: '404' } };
    }
    
    mockPressReleases.splice(pressReleaseIndex, 1);
    
    return { data: void 0 };
  }
  
  async sendPressRelease(id: string): Promise<ApiResponse<PressRelease>> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja opóźnienia
    
    const pressReleaseIndex = mockPressReleases.findIndex(pr => pr.id === id);
    
    if (pressReleaseIndex === -1) {
      return { error: { message: 'Komunikat prasowy nie został znaleziony', code: '404' } };
    }
    
    if (mockPressReleases[pressReleaseIndex].status === 'sent') {
      return { error: { message: 'Komunikat prasowy został już wysłany', code: '400' } };
    }
    
    const updatedPressRelease = {
      ...mockPressReleases[pressReleaseIndex],
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        sentCount: Math.floor(Math.random() * 50) + 30,
        deliveredCount: Math.floor(Math.random() * 40) + 25,
        openCount: Math.floor(Math.random() * 30) + 10,
        clickCount: Math.floor(Math.random() * 20) + 5,
        responseCount: Math.floor(Math.random() * 10)
      }
    };
    
    mockPressReleases[pressReleaseIndex] = updatedPressRelease;
    
    return { data: updatedPressRelease };
  }
  
  async schedulePressRelease(id: string, date: string): Promise<ApiResponse<PressRelease>> {
    await new Promise(resolve => setTimeout(resolve, 700)); // Symulacja opóźnienia
    
    const pressReleaseIndex = mockPressReleases.findIndex(pr => pr.id === id);
    
    if (pressReleaseIndex === -1) {
      return { error: { message: 'Komunikat prasowy nie został znaleziony', code: '404' } };
    }
    
    if (mockPressReleases[pressReleaseIndex].status === 'sent') {
      return { error: { message: 'Komunikat prasowy został już wysłany', code: '400' } };
    }
    
    const updatedPressRelease = {
      ...mockPressReleases[pressReleaseIndex],
      status: 'scheduled' as const,
      scheduledFor: date,
      updatedAt: new Date().toISOString(),
    };
    
    mockPressReleases[pressReleaseIndex] = updatedPressRelease;
    
    return { data: updatedPressRelease };
  }

  // Metody dla grup mediów
  async getMediaGroups(params?: MediaGroupQueryParams): Promise<ApiResponse<MediaGroup[]>> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Symulacja opóźnienia
    
    let filteredGroups = [...mockMediaGroups];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredGroups = filteredGroups.filter(group => 
        group.name.toLowerCase().includes(search) || 
        (group.description && group.description.toLowerCase().includes(search)) ||
        group.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    return { data: filteredGroups };
  }
  
  async getMediaGroup(id: string): Promise<ApiResponse<MediaGroup>> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Symulacja opóźnienia
    
    const group = mockMediaGroups.find(g => g.id === id);
    
    if (!group) {
      return { error: { message: 'Grupa mediów nie została znaleziona', code: '404' } };
    }
    
    return { data: group };
  }
  
  async createMediaGroup(data: MediaGroupForm): Promise<ApiResponse<MediaGroup>> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Symulacja opóźnienia
    
    const newGroup: MediaGroup = {
      id: generateId(),
      name: data.name,
      description: data.description,
      tags: data.tags,
      contactCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    };
    
    mockMediaGroups.push(newGroup);
    
    return { data: newGroup };
  }
  
  async updateMediaGroup(id: string, data: Partial<MediaGroupForm>): Promise<ApiResponse<MediaGroup>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    const groupIndex = mockMediaGroups.findIndex(g => g.id === id);
    
    if (groupIndex === -1) {
      return { error: { message: 'Grupa mediów nie została znaleziona', code: '404' } };
    }
    
    const updatedGroup = {
      ...mockMediaGroups[groupIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    mockMediaGroups[groupIndex] = updatedGroup;
    
    return { data: updatedGroup };
  }
  
  async deleteMediaGroup(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    const groupIndex = mockMediaGroups.findIndex(g => g.id === id);
    
    if (groupIndex === -1) {
      return { error: { message: 'Grupa mediów nie została znaleziona', code: '404' } };
    }
    
    mockMediaGroups.splice(groupIndex, 1);
    
    // Usuń grupę z kontaktów
    mockMediaContacts.forEach(contact => {
      contact.groups = contact.groups.filter(groupId => groupId !== id);
    });
    
    return { data: void 0 };
  }

  // Metody dla kontaktów medialnych
  async getMediaContacts(params?: MediaContactQueryParams): Promise<ApiResponse<MediaContact[]>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    let filteredContacts = [...mockMediaContacts];
    
    if (params?.groupId) {
      filteredContacts = filteredContacts.filter(c => c.groups.includes(params.groupId!));
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredContacts = filteredContacts.filter(contact => 
        contact.firstName.toLowerCase().includes(search) || 
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.mediaOutlet.toLowerCase().includes(search)
      );
    }
    
    if (params?.mediaOutlet) {
      filteredContacts = filteredContacts.filter(c => c.mediaOutlet === params.mediaOutlet);
    }
    
    if (params?.tags && params.tags.length > 0) {
      filteredContacts = filteredContacts.filter(c => 
        c.tags && c.tags.some(tag => params.tags!.includes(tag))
      );
    }
    
    return { data: filteredContacts };
  }
  
  async getMediaContact(id: string): Promise<ApiResponse<MediaContact>> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Symulacja opóźnienia
    
    const contact = mockMediaContacts.find(c => c.id === id);
    
    if (!contact) {
      return { error: { message: 'Kontakt medialny nie został znaleziony', code: '404' } };
    }
    
    return { data: contact };
  }
  
  async createMediaContact(data: MediaContactForm): Promise<ApiResponse<MediaContact>> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Symulacja opóźnienia
    
    const newContact: MediaContact = {
      id: generateId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      mediaOutlet: data.mediaOutlet,
      position: data.position,
      notes: data.notes,
      groups: data.groups,
      tags: data.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockMediaContacts.push(newContact);
    
    // Aktualizuj liczniki kontaktów w grupach
    data.groups.forEach(groupId => {
      const groupIndex = mockMediaGroups.findIndex(g => g.id === groupId);
      if (groupIndex !== -1) {
        mockMediaGroups[groupIndex].contactCount++;
      }
    });
    
    return { data: newContact };
  }
  
  async updateMediaContact(id: string, data: Partial<MediaContactForm>): Promise<ApiResponse<MediaContact>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    const contactIndex = mockMediaContacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return { error: { message: 'Kontakt medialny nie został znaleziony', code: '404' } };
    }
    
    const oldGroups = mockMediaContacts[contactIndex].groups;
    const newGroups = data.groups || oldGroups;
    
    const updatedContact = {
      ...mockMediaContacts[contactIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    mockMediaContacts[contactIndex] = updatedContact;
    
    // Aktualizuj liczniki kontaktów w grupach jeśli grupy się zmieniły
    if (data.groups) {
      // Zmniejsz liczniki w starych grupach, które nie są już używane
      oldGroups.filter(group => !newGroups.includes(group)).forEach(groupId => {
        const groupIndex = mockMediaGroups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          mockMediaGroups[groupIndex].contactCount--;
        }
      });
      
      // Zwiększ liczniki w nowych grupach
      newGroups.filter(group => !oldGroups.includes(group)).forEach(groupId => {
        const groupIndex = mockMediaGroups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          mockMediaGroups[groupIndex].contactCount++;
        }
      });
    }
    
    return { data: updatedContact };
  }
  
  async deleteMediaContact(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia
    
    const contactIndex = mockMediaContacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return { error: { message: 'Kontakt medialny nie został znaleziony', code: '404' } };
    }
    
    const groups = mockMediaContacts[contactIndex].groups;
    
    mockMediaContacts.splice(contactIndex, 1);
    
    // Aktualizuj liczniki kontaktów w grupach
    groups.forEach(groupId => {
      const groupIndex = mockMediaGroups.findIndex(g => g.id === groupId);
      if (groupIndex !== -1) {
        mockMediaGroups[groupIndex].contactCount--;
      }
    });
    
    return { data: void 0 };
  }
  
  async importMediaContacts(file: File): Promise<ApiResponse<{ successful: number; failed: number }>> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Symulacja opóźnienia
    
    // Symuluj import
    const successful = Math.floor(Math.random() * 20) + 5;
    const failed = Math.floor(Math.random() * 5);
    
    return { data: { successful, failed } };
  }
}

export const mockPressReleaseService = new MockPressReleaseService();
